import { callOpenRouter } from "./openRouterClient.js";

const STRONG_VERBS = [
  "Engineered",
  "Architected",
  "Spearheaded",
  "Implemented",
  "Optimized",
  "Developed",
  "Orchestrated",
  "Streamlined",
  "Automated",
  "Deployed",
];

const rewriteLocally = (text) => {
  if (!text) return text;
  let cleaned = text.trim().replace(/^[\u2022\-•*]\s*/, "");

  // Replace common weak openings
  if (/^worked on\s+/i.test(cleaned)) {
    cleaned = cleaned.replace(/^worked on\s+/i, "Engineered and delivered ");
  } else if (/^responsible for\s+/i.test(cleaned)) {
    cleaned = cleaned.replace(/^responsible for\s+/i, "Spearheaded the development of ");
  } else if (/^(helped|assisted)\s+(with|in)?\s*/i.test(cleaned)) {
    cleaned = cleaned.replace(/^(helped|assisted)\s+(with|in)?\s*/i, "Collaborated cross-functionally to implement ");
  } else if (/^handled\s+/i.test(cleaned)) {
    cleaned = cleaned.replace(/^handled\s+/i, "Successfully managed and executed ");
  } else if (/^participated in\s+/i.test(cleaned)) {
    cleaned = cleaned.replace(/^participated in\s+/i, "Actively contributed to the architecture and delivery of ");
  } else {
    // If it doesn't already start with an action verb, enhance it
    const firstWord = cleaned.split(" ")[0];
    const isCapitalized = /^[A-Z][a-z]+/.test(firstWord);
    if (!isCapitalized) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    // Add active impact phrasing if concise
    if (cleaned.length < 50 && !/\b(improving|optimizing|reducing|increasing|ensuring)\b/i.test(cleaned)) {
      cleaned = `${cleaned}, ensuring high system reliability and streamlined performance`;
    }
  }

  // Ensure trailing period
  if (!cleaned.endsWith(".")) {
    cleaned += ".";
  }

  return cleaned;
};

export const rewriteAISuggestionWithOpenRouter = async (text) => {
  if (!text) return "";

  if (!process.env.OPENROUTER_API_KEY) {
    return rewriteLocally(text);
  }

  const prompt = `
You are an expert resume writing assistant.

Rewrite the following resume bullet point to be stronger, concise, and start with a powerful action verb.

Return ONLY one rewritten bullet point. DO NOT return multiple options. DO NOT include explanations, footnotes, markdown, or comments.

Just respond with one clean bullet point.

Original:
"${text}"

Rewritten:
`;

  try {
    const { content } = await callOpenRouter({
      messages: [
        { role: "system", content: "You are a resume rewriting assistant." },
        { role: "user", content: prompt },
      ],
      title: "ReviewCV AI Rewrite Tool",
      timeout: 30000,
    });

    let result = content.trim();
    result = result.split("\n")[0];
    result = result.replace(/^["'""]+|["'""]+$/g, "").trim();

    if (result.includes(" or ")) {
      result = result.split(" or ")[0].trim();
    }

    return result || rewriteLocally(text);
  } catch (err) {
    console.warn("⚠️ AI Rewrite warning (using local smart rewrite):", err.message);
    return rewriteLocally(text);
  }
};
