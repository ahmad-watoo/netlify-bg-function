// import { Storage } from "@google-cloud/storage";
// import path from "path";
// import fs from "fs";

// // Load credentials
// // const serviceKeyPath = path.join(process.cwd(), process.env.GOOGLE_CREDENTIALS_BASE64); // your JSON key
// // const storage = new Storage({
// //   keyFilename: serviceKeyPath,
// // });

// const storage = new Storage({
//   credentials: JSON.parse(
//     Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString(
//       "utf8"
//     )
//   ),
// });

// const BUCKET_NAME = "angus-gcs-test";

// export async function gcs(localFilePath) {
//   const destinationPathInBucket = `training-plan-${Date.now()}.pdf`;
//   const bucket = storage.bucket(BUCKET_NAME);

//   await bucket.upload(localFilePath, {
//     destination: destinationPathInBucket,
//     gzip: true,
//     metadata: {
//       cacheControl: "public, max-age=31536000",
//       contentDisposition: 'inline; filename="Training-Plan.pdf"',
//     },
//   });

//   // const [url] = await bucket
//   // .file(destinationPathInBucket)
//   // .getSignedUrl({
//   //   version: 'v4',
//   //   action: 'read',
//   //   expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
//   //   ignoreExtraQueryParams: true,
//   // });
//   // Make it public (optional)
//   const response = await bucket.file(destinationPathInBucket).makePublic();
//   const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${destinationPathInBucket}`;
//   console.log("response from public", response, publicUrl);

//   return publicUrl;
// }

// export async function gcsResponseFileUpload(
//   localFilePath,
//   destinationPathInBucket
// ) {
//   const bucket = storage.bucket(BUCKET_NAME);

//   await bucket.upload(localFilePath, {
//     destination: destinationPathInBucket,
//     gzip: true,
//     metadata: {
//       cacheControl: "public, max-age=31536000",
//     },
//   });

//   const response = await bucket.file(destinationPathInBucket).makePublic();
//   const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${destinationPathInBucket}`;
//   console.log("response from public", response, publicUrl);

//   return publicUrl;
// }

// export async function gcsfetchResponseFile(destinationPathInBucket) {
//   const bucket = storage.bucket(BUCKET_NAME);
//   const fileRef = bucket.file(destinationPathInBucket);

//   try {
//     const [fileBuffer] = await fileRef.download();
//     const parsedData = JSON.parse(fileBuffer.toString("utf8"));
//     return parsedData;
//   } catch (error) {
//     if (error.code === 404) {
//       // File not found – let the handler catch this
//       throw new Error("FILE_NOT_FOUND");
//     }
//     // Re-throw other errors
//     throw error;
//   }
// }
