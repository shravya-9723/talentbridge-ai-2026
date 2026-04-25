import { NextResponse } from "next/server";
import mammoth from "mammoth";

// @ts-ignore
const pdfParse = require("pdf-parse");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({
        success: true,
        data: { text: "" },
      });
    }

    const fileName = file.name.toLowerCase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";

    if (fileName.endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      text = data.text || "";
    } else if (fileName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else if (fileName.endsWith(".txt")) {
      text = new TextDecoder().decode(bytes);
    } else {
      text = "File uploaded (no parsing)";
    }

    return NextResponse.json({
      success: true,
      data: { text: text.trim() },
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: { text: "Parsing failed. Paste manually." },
    });
  }
}
