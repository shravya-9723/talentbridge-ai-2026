import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "File is required." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";
    if (fileName.endsWith(".pdf")) {
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      text = parsed.text ?? "";
      await parser.destroy();
    } else if (fileName.endsWith(".docx")) {
      const parsed = await mammoth.extractRawText({ buffer });
      text = parsed.value ?? "";
    } else if (fileName.endsWith(".txt")) {
      text = new TextDecoder().decode(bytes);
    } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png")) {
      text = "Image uploaded";
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported file type. Use PDF, DOCX, TXT, JPG, PNG, or JPEG." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { text: text.trim() || "No readable text extracted." },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to parse file.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
