import { Handler } from "@netlify/functions";
import {
  klaviyoService,
  createPDFService,
  gptService,
  promptService,
  gcsService,
} from "../../lib/index";

export const handler: Handler = async (event, context) => {
  // CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Add explicit null check for event.body
  if (!event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Request body is missing" }),
    };
  }

  try {
    // Now we know event.body exists, so we can safely parse it
    // const requestBody = JSON.parse(event.body);
    const { formData, requestId } = JSON.parse(event.body);
    // Add validation for request body structure
    // if (!requestBody.formData || !requestBody.requestId) {
    //   return {
    //     statusCode: 400,
    //     headers,
    //     body: JSON.stringify({ error: "Invalid request format" }),
    //   };
    // }

    // const { formData, requestId } = requestBody;

    // Validate required fields
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
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        }),
      };
    }

    // Generate training plan content
    const { systemPrompt, userPrompt } = promptService.assemblePrompt({
      fullName: formData.fullName,
      experienceLevel: formData.experienceLevel,
      raceDistance: formData.raceDistance,
      desiredRaceTime: formData.desiredRaceTime,
      raceDate: formData.raceDate,
    });
    const planContent = await gptService.generateResponse({
      systemPrompt,
      userPrompt,
    });
    // Create PDF
    const pdfPath = await createPDFService.createPDF(planContent);
    const pdfUrl = await gcsService.gcs(pdfPath);
    console.log("PDF URL:", pdfUrl);
    // Send email
    await klaviyoService.sendPDFLinkToKlaviyo(formData, pdfUrl);
    // Process in background
    context.callbackWaitsForEmptyEventLoop = false;
    setTimeout(() => {
      // Additional background processing if needed
      console.log("Background processing completed for request:", requestId);
    }, 0);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        pdfUrl,
        message: "Training plan generated successfully",
      }),
    };
  } catch (error) {
    console.error("Error generating training plan:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to generate training plan",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
