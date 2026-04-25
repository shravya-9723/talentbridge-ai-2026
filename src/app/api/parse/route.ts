export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return NextResponse.json({
        success: true,
        data: { text: "" },
      });
    }

    const fileName = (file as any).name?.toLowerCase() || "";
    const bytes = await (file as any).arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";

    if (fileName.endsWith(".pdf")) {
      // 🔥 lazy load (VERY IMPORTANT)
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      text = data.text || "";
    } 
    else if (fileName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } 
    else if (fileName.endsWith(".txt")) {
      text = new TextDecoder().decode(bytes);
    } 
    else {
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
