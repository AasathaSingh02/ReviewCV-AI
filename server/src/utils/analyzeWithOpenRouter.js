import { callOpenRouter } from "./openRouterClient.js";
import { analyzeResumeLocally } from "./localResumeAnalyzer.js";

export const analyzeWithOpenRouter = async (resumeText) => {
  const truncatedResumeText = (resumeText || "").slice(0, 8000);

  // If no OpenRouter key is set, immediately use the smart heuristic analyzer
  if (!process.env.OPENROUTER_API_KEY) {
    console.log("ℹ️ OPENROUTER_API_KEY not set. Using smart local ATS analyzer.");
    return analyzeResumeLocally(truncatedResumeText);
  }

  const prompt = `
You are a strict and professional ATS resume analyzer trained on Resume Worded, Jobscan, and recruiter screening data.

Your job is to analyze the following resume and return ONLY valid JSON with these exact keys:

{
  "ats_score": <integer 1-100>,
  "suggestions": ["string"],
  "repeated_phrases": ["string"],
  "buzzwords": ["string"],
  "action_verbs": ["string"],
  "missing_sections": ["string"],
  "tone_analysis": "string",
  "verdict_summary": "string",
  "eligible_roles": ["string"]
}

### ATS Scoring Rules:
- ats_score MUST be an integer from 1 to 100. Never return 0.
- Give 90+ only if it's nearly perfect.
- Penalize vague descriptions, weak verbs, repetition, and lack of measurable results.
- Score 60–80 for decent resumes, <60 for basic ones.
- Compute a realistic score from the actual resume content below.

### Section Detection Rules:
Only count these as "present" if explicitly labeled in the resume:
- Professional Summary
- Work Experience / Experience
- Projects
- Skills
- Education
- Certifications
- Awards / Honors

Do not assume a section exists unless clearly titled. Return all missing sections.

### Eligible Roles Rules:
- Based on the candidate's skills, projects, and experience, list 4-6 specific job roles they are eligible for.
- Examples: "Frontend Developer", "Full Stack Developer", "Data Scientist", "DevOps Engineer", "Python Developer", "Android Developer"
- Be specific and realistic — only roles the candidate's skills support.

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations, no comments. Just the JSON object starting with { and ending with }.

Resume Text:
${truncatedResumeText}
`;

  try {
    const { content } = await callOpenRouter({
      messages: [
        { role: "system", content: "You are an expert ATS resume analyzer." },
        { role: "user", content: prompt },
      ],
      title: "ReviewCV AI Resume Analyzer",
      timeout: 60000,
      temperature: 0.2,
    });

    let result = content;
    const scoreFromRaw = extractAtsScoreFromText(content);
    console.log("✅ OpenRouter AI Raw Response received");

    result = result
      .replace(/```json|```/g, "")
      .replace(/\\n/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\_/g, "_")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\s{2,}/g, " ")
      .trim();

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = jsonMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      console.warn("⚠️ JSON parse error from OpenRouter response, using local analyzer fallback:", e.message);
      return analyzeResumeLocally(truncatedResumeText);
    }

    const aiScore =
      normalizeAtsScore(parsed?.ats_score) ??
      normalizeAtsScore(parsed?.score) ??
      extractAtsScoreFromText(result) ??
      scoreFromRaw;

    // Merge with local fallback if OpenRouter missed critical fields
    const localFallback = analyzeResumeLocally(truncatedResumeText);

    parsed.ats_score = aiScore ?? localFallback.ats_score;
    parsed.suggestions = Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
      ? parsed.suggestions
      : localFallback.suggestions;
    parsed.missing_sections = Array.isArray(parsed.missing_sections)
      ? [...new Set([...parsed.missing_sections, ...localFallback.missing_sections])]
      : localFallback.missing_sections;
    parsed.action_verbs = Array.isArray(parsed.action_verbs) && parsed.action_verbs.length > 0
      ? parsed.action_verbs
      : localFallback.action_verbs;
    parsed.buzzwords = Array.isArray(parsed.buzzwords) && parsed.buzzwords.length > 0
      ? parsed.buzzwords
      : localFallback.buzzwords;
    parsed.repeated_phrases = Array.isArray(parsed.repeated_phrases) && parsed.repeated_phrases.length > 0
      ? parsed.repeated_phrases
      : localFallback.repeated_phrases;
    parsed.tone_analysis = parsed.tone_analysis || localFallback.tone_analysis;
    parsed.verdict_summary = parsed.verdict_summary || localFallback.verdict_summary;
    // ✅ Keep eligible_roles if AI returned them, else use local fallback
    parsed.eligible_roles = Array.isArray(parsed.eligible_roles) && parsed.eligible_roles.length > 0
      ? parsed.eligible_roles
      : (localFallback.eligible_roles || []);

    return parsed;
  } catch (err) {
    console.warn("⚠️ OpenRouter API unavailable, using smart local analyzer fallback:", err.message);
    const fallback = analyzeResumeLocally(truncatedResumeText);
    return {
      ...fallback,
      ai_warning: `OpenRouter notice: ${err.message}. Showing smart local ATS analysis.`,
    };
  }
};

function normalizeAtsScore(value) {
  if (value === null || value === undefined) return null;
  const raw = typeof value === "number" ? value : Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(raw)) return null;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function extractAtsScoreFromText(text) {
  if (!text) return null;
  const match =
    String(text).match(/["']?ats_score["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)["']?/i) ||
    String(text).match(/["']?score["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)["']?/i) ||
    String(text).match(/ATS\s*Score\s*[:=]\s*["']?(\d+(?:\.\d+)?)["']?/i);
  if (!match) return null;
  return normalizeAtsScore(match[1]);
}
