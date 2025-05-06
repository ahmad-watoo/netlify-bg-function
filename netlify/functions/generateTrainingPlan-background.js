import { OpenAI } from "openai";
// Add dotenv for local development
import dotenv from "dotenv";
// Remove unused imports (services are now in background func)
import {
  klaviyoService,
  createPDFService,
  gptService,
  promptService,
  gcsService,
} from "../../lib/index.js";
import fetch from "node-fetch"; // Import node-fetch
import path from "path";
import fs from "fs";
import os from "os";

// Remove the static import for the background handler
// import { handler as backgroundHandler } from './backgroundPlanGenerator-background.js';

// Load environment variables from .env file in local development
if (process.env.NODE_ENV !== "production") {
  console.log("Loading environment variables from .env file");
  dotenv.config();
}

// Helper functions to reduce main code size
const createErrorResponse = (statusCode, headers, error, details) => ({
  statusCode,
  headers,
  body: JSON.stringify({ error, details }),
});

const logInfo = (message, data) => console.log(message, data);
const logError = (message, data) => console.error(message, data);

export const handler = async function (event, context) {
  // Enable CORS and set JSON content type
  const headers = {
    "Access-Control-Allow-Origin": "*", // Allow all origins for now
    "Access-Control-Allow-Headers": "Content-Type, Origin, Accept",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  logInfo("Environment info:", {
    nodeEnv: process.env.NODE_ENV,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyLength: process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.length
      : 0,
    // Add checks for other keys if needed (e.g., email service keys)
  });

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Successful preflight call" }),
    };
  }

  // Ensure request is POST
  if (event.httpMethod !== "POST") {
    return createErrorResponse(405, headers, "Method not allowed", null);
  }

  let formData; // Declare formData in outer scope for logging in catch block
  let requestId; // Get the request ID from the contex
  try {
    // --- Start of Updated Workflow ---

    // 1. Parse and Validate Input (Keep this part)
    const parsedBody = JSON.parse(event.body);
    formData = parsedBody.formData;
    requestId = parsedBody.requestId; // Get the request ID from the context

    if (!formData) {
      return createErrorResponse(
        400,
        headers,
        "Missing form data in request",
        "The request must include formData"
      );
    }

    logInfo("Request received:", {
      user: formData.fullName,
      email: formData.email, // Log email as well
      experience: formData.experienceLevel,
      race: formData.raceDistance,
    });

    // Validate required form fields (keep and add email)
    const requiredFields = [
      "fullName",
      "email",
      "experienceLevel",
      "raceDistance",
      "raceDate",
      "desiredRaceTime",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return createErrorResponse(
        400,
        headers,
        "Missing required form fields",
        `The following fields are required: ${missingFields.join(", ")}`
      );
    }

    // Calculate training duration (keep, but not strictly needed for background trigger)
    const today = new Date();
    const raceDate = new Date(formData.raceDate);
    if (isNaN(raceDate.getTime())) {
      return createErrorResponse(
        400,
        headers,
        "Invalid race date format",
        "Please provide the date in a valid format (e.g., YYYY-MM-DD)."
      );
    }
    const trainingDuration = Math.ceil(
      (raceDate - today) / (1000 * 60 * 60 * 24)
    ); // Calculate days

    if (trainingDuration <= 0) {
      return createErrorResponse(
        400,
        headers,
        "Invalid race date",
        "Race date must be in the future"
      );
    }
    // No need to log duration here anymore as it's not used in this function

    // --- Remove Service Calls (Moved to Background) ---
    // Steps 2-6 (Assemble Prompt, Call GPT, Process, Generate PDF, Send Email) are removed

    // Prepare the payload
    const payload = { formData };
    // console.log(formData);
    logInfo("Assembling prompt...");
    const { systemPrompt, userPrompt } = promptService.assemblePrompt(formData);

    // 3. Call GPT Service
    logInfo("Calling GPT service...");
    const gptPlanText = await gptService.generateResponse({
      systemPrompt,
      userPrompt,
    });
    // console.log(gptPlanText);
    logInfo("GPT response received successfully.");

    // 4. Generate PDF (Keep this part)
    logInfo("Generating PDF...");
    const pdfFilePath = await createPDFService.createPDF(gptPlanText); // Call the PDF generation function directly
    console.log("pdfFilePath", pdfFilePath);

    // Upload the PDF to GCS
    logInfo("Uploading PDF to GCS...");
    const gcsUrl = await gcsService.gcs(pdfFilePath);
    console.log("PDF URL:", gcsUrl);

    // --- Return 202 Accepted ---
    // Immediately respond to the client indicating the request was accepted
    // and processing has started in the background.
    console.log("PDF generated successfully.");
    const tmpDir = os.tmpdir(); // works cross-platform
    // Ensure the status directory exists in the temp directory
    // const statusDir = path.join(tmpDir, 'status');
    // await fs.promises.mkdir(tmpDir, { recursive: true });
    const outputStatusFilePathName = path.join(tmpDir, `${requestId}.json`);
    console.log(" outputStatusFilePathName => ", outputStatusFilePathName);

    await fs.promises.writeFile(
      outputStatusFilePathName,
      JSON.stringify({ url: gcsUrl })
    );
    const destinationResponseFile = `response/${requestId}.json`;
    const responseFileURL = await gcsService.gcsResponseFileUpload(
      outputStatusFilePathName,
      destinationResponseFile
    );
    console.log("responseFileURL =>", responseFileURL);

    logInfo("Starting KlaviyoService...");
    await klaviyoService.sendPDFLinkToKlaviyo(formData, gcsUrl);
    console.log("KlaviyoService completed successfully.");

    return {
      statusCode: 202, // Accepted
      headers,
      body: JSON.stringify({
        payload,
        trainingPlanUrl: gcsUrl,
        message:
          "Request accepted. Your training plan is being generated and will be emailed to you shortly.",
      }),
    };
  } catch (error) {
    // --- Simplified Error Handling for Trigger Function ---
    // Log the error primarily related to parsing or initial validation
    logError("Trigger function error:", {
      message: error.message,
      stack: error.stack,
      context: { user: formData?.fullName, email: formData?.email },
    });

    // Determine user-friendly message based on the error type
    let userMessage =
      "There was a problem submitting your request. Please check your input and try again.";
    let errorCode = 500; // Default to Internal Server Error

    if (error instanceof SyntaxError) {
      // Error parsing request body
      userMessage =
        "Invalid request format. Please ensure your submission is correct.";
      errorCode = 400; // Bad Request
    } else if (
      error.message.includes("Missing") ||
      error.message.includes("Invalid")
    ) {
      // Catch our specific validation errors
      userMessage = error.message; // Use the specific validation message
      errorCode = 400;
    }

    // Return the standardized error response
    return createErrorResponse(errorCode, headers, userMessage, error.message); // Provide relevant message to user
  }
};
