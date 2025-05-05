import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  // This function will run in the background after response
  console.log("Background function started");

  // Simulate some async work
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("Background work completed");

  // For background functions, we don't need to return a response
  return {
    statusCode: 202, // Accepted status code
    body: JSON.stringify({ message: "Background task started" }),
  };
};

export { handler };
