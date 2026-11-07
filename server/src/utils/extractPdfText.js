import fs from "fs";
import path from "path";
import pdf from "pdf-parse/lib/pdf-parse.js";
import PDFParser from "pdf2json";
import { fromPath } from "pdf2pic";
import { createWorker } from "tesseract.js";

const TMP_PATH = path.join("tmp");
if (!fs.existsSync(TMP_PATH)) fs.mkdirSync(TMP_PATH);

/**
 * Extract text using pdf2json as secondary parser
 */
const extractWithPdf2Json = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(errData.parserError || new Error("pdf2json parser error"));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          // Primary: get raw text
          let text = pdfParser.getRawTextContent();
          if (text && text.trim().length > 30) {
            return resolve(text.trim());
          }

          // Fallback: parse texts from pages
          if (pdfData && pdfData.Pages) {
            const pageTexts = pdfData.Pages.map((page) =>
              (page.Texts || [])
                .map((t) => decodeURIComponent((t.R && t.R[0] && t.R[0].T) || ""))
                .join(" ")
            ).join("\n");
            
            if (pageTexts.trim().length > 20) {
              return resolve(pageTexts.trim());
            }
          }
          
          resolve("");
        } catch (e) {
          reject(e);
        }
      });

      pdfParser.loadPDF(filePath);
    } catch (e) {
      reject(e);
    }
  });
};

export const extractPdfText = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found: ${filePath}`);
  }

  // Strategy 1: pdf-parse
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    if (data.text && data.text.trim().length > 30) {
      console.log("✅ PDF text extracted via pdf-parse");
      return data.text.trim();
    }
  } catch (pdfParseError) {
    console.warn("⚠️ pdf-parse failed:", pdfParseError.message, "— attempting pdf2json fallback...");
  }

  // Strategy 2: pdf2json (handles compressed xref streams and character codes that crash pdf-parse)
  try {
    const text2 = await extractWithPdf2Json(filePath);
    if (text2 && text2.trim().length > 30) {
      console.log("✅ PDF text extracted via pdf2json fallback");
      return text2.trim();
    }
  } catch (pdf2jsonError) {
    console.warn("⚠️ pdf2json failed:", pdf2jsonError.message, "— attempting OCR fallback...");
  }

  // Strategy 3: OCR fallback using pdf2pic + tesseract.js
  try {
    console.log("ℹ️ Attempting OCR text extraction...");
    const convert = fromPath(filePath, {
      density: 200,
      saveFilename: "resume-page",
      savePath: TMP_PATH,
      format: "png",
      width: 1500,
      height: 2100,
    });

    const worker = await createWorker("eng");
    let pageNum = 1;
    let fullText = "";

    while (pageNum <= 5) { // Maximum 5 pages to prevent timeouts
      try {
        const page = await convert(pageNum);
        if (!page?.path || !fs.existsSync(page.path)) break;

        const {
          data: { text },
        } = await worker.recognize(page.path);
        
        fullText += "\n" + (text || "").trim();
        if (fs.existsSync(page.path)) fs.unlinkSync(page.path);
        pageNum++;
      } catch {
        break;
      }
    }

    await worker.terminate();

    if (fullText.trim().length > 20) {
      console.log("✅ PDF text extracted via OCR");
      return fullText.trim();
    }
  } catch (ocrErr) {
    console.error("❌ OCR extraction error:", ocrErr.message);
  }

  throw new Error("Unable to extract text from this PDF. Please ensure the file contains readable text or export it as a standard PDF.");
};
