import { gcsService } from "../../lib/index.js";

export const handler = async (event) => {
  const { requestId } = JSON.parse(event.body);
  // console.log("requested ID :-", requestId);
  const headers = {
    "Access-Control-Allow-Origin": "*", // Your frontend domain
    "Access-Control-Allow-Headers": "Content-Type, Accept, Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
  try {
    const data = await gcsService.gcsfetchResponseFile(
      `response/${requestId}.json`
    );

    console.log("gcsfetchResponseFile =>", data);

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    if (error.message === "FILE_NOT_FOUND") {
      console.log("FILE_NOT_FOUND Processing", error);

      return {
        statusCode: 202,
        headers: headers,
        body: JSON.stringify({ status: "Processing" }),
      };
    }

    console.error("Unexpected error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
