import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  // Complete CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  // Immediate response for background processing
  const response = {
    statusCode: 202,
    headers,
    body: JSON.stringify({
      message: "Background task started successfully",
      receivedData: event.body ? JSON.parse(event.body) : null,
    }),
  };

  // Process in background
  context.callbackWaitsForEmptyEventLoop = false;
  processBackgroundTask(event);

  return response;
};

async function processBackgroundTask(event: any) {
  try {
    const data = event.body ? JSON.parse(event.body) : null;
    console.log("Background processing started with:", data);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("Background processing completed");
    // Your actual background work here
  } catch (error) {
    console.error("Background processing error:", error);
  }
}

export { handler };
