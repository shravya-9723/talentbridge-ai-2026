export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mammoth from "mammoth";

/**
 * API Route: File Parser for Vercel
 * Supports: .pdf, .docx, .txt
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // 1. Validation
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "No file provided or invalid file format." },
        { status: 400 }
      );
    }

    const fileName = file.name?.toLowerCase() || "";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    // 2. Parsing Logic
    if (fileName.endsWith(".pdf")) {
      try {
        /**
         * Dynamic import with fallback logic to handle CommonJS/ESM compatibility 
         * and resolve the VS Code '.default' error.
         */
        const pdfModule = await import("pdf-parse");
        // Use .default if it exists, otherwise use the module itself
        const pdfParse = (pdfModule as any).default || pdfModule;
        
        const data = await pdfParse(buffer);
        extractedText = data.text || "";
      } catch (pdfError) {
        console.error("PDF Parse Error:", pdfError);
        extractedText = "Error: Could not parse PDF content.";
      }
    } 
    else if (fileName.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (docxError) {
        console.error("DOCX Parse Error:", docxError);
        extractedText = "Error: Could not parse Word document.";
      }
    } 
    else if (fileName.endsWith(".txt")) {
      extractedText = new TextDecoder().decode(arrayBuffer);
    } 
    else {
      extractedText = "File uploaded, but format is not supported for auto-parsing.";
    }

    // 3. Return Cleaned Response
    return NextResponse.json({
      success: true,
      data: {
        text: extractedText.trim(),
        filename: fileName,
      },
    });

  } catch (error: any) {
    console.error("Global Handler Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        data: { text: "Parsing failed. Please paste the text manually." },
        error: error.message 
      },
      { status: 500 }
    );
  }
}
