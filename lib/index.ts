// lib/index.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import os from "os";
import path from "path";
import { OpenAI } from "openai";
import fetch from "node-fetch";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: "",
});
if (!openai.apiKey) {
  console.error("OpenAI API key is missing!");
  throw new Error("OpenAI API key is missing");
}
// PDF Service
export const createPDFService = {
  async createPDF(content: string): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([550, 750]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add title
    page.drawText("Personalized Training Plan", {
      x: 50,
      y: height - 50,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });

    // Add content
    let yPosition = height - 100;
    const lines = content.split("\n");
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    }

    // Save to temporary file
    const pdfBytes = await pdfDoc.save();
    const tempDir = os.tmpdir();
    const pdfPath = path.join(tempDir, `training-plan-${Date.now()}.pdf`);
    fs.writeFileSync(pdfPath, pdfBytes);

    return pdfPath;
  },
};

// GPT Service
export const gptService = {
  async generateResponse({
    systemPrompt,
    userPrompt,
  }: {
    systemPrompt: string,
    userPrompt: string,
  }) {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "";
  },
};

// Prompt Service
export const promptService = {
  assemblePrompt(formData: any) {
    const systemPrompt = `You are a professional running coach creating personalized training plans.`;

    const userPrompt = `Create a ${formData.raceDistance} training plan for a ${formData.experienceLevel} runner.
      Name: ${formData.fullName}
      Target time: ${formData.desiredRaceTime}
      Race date: ${formData.raceDate}
      Include weekly mileage, workout types, and rest days.`;

    return { systemPrompt, userPrompt };
  },
};

// Mock GCS Service (replace with real implementation)
export const gcsService = {
  async gcs(filePath: string): Promise<string> {
    // In a real implementation, upload to Google Cloud Storage
    // For demo, we'll just return a mock URL
    return `https://example.com/training-plans/${path.basename(filePath)}`;
  },

  async gcsResponseFileUpload(
    filePath: string,
    destination: string
  ): Promise<string> {
    // Mock implementation
    return `https://example.com/status/${destination}`;
  },

  async gcsfetchResponseFile(filePath: string): Promise<any> {
    // Mock implementation
    return {
      status: "complete",
      url: `https://example.com/training-plans/plan-123.pdf`,
    };
  },
};

// Mock Klaviyo Service
export const klaviyoService = {
  async sendPDFLinkToKlaviyo(formData: any, pdfUrl: string) {
    console.log(
      `Would send email to ${formData.email} with PDF link: ${pdfUrl}`
    );
    // Actual implementation would use Klaviyo API
  },
};
