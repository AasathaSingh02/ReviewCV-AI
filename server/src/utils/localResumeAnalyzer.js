/**
 * High-quality heuristic resume analyzer.
 * Used whenever OpenRouter API key is not configured, credits are exhausted, or during offline dev.
 */

const ACTION_VERB_LIST = [
  "accelerated", "achieved", "administered", "analyzed", "architected", "automated",
  "built", "championed", "collaborated", "configured", "constructed", "coordinated",
  "created", "debugged", "delivered", "deployed", "designed", "developed",
  "devised", "directed", "engineered", "enhanced", "established", "executed",
  "formulated", "generated", "guided", "implemented", "improved", "increased",
  "initiated", "inspected", "installed", "instituted", "integrated", "launched",
  "led", "managed", "mentored", "modernized", "optimized", "orchestrated",
  "overhauled", "pioneered", "planned", "produced", "programmed", "reduced",
  "refactored", "resolved", "revamped", "scaled", "spearheaded", "streamlined",
  "strengthened", "supervised", "tested", "transformed", "upgraded"
];

const BUZZWORD_LIST = [
  "hardworking", "hard-working", "team player", "go-getter", "detail-oriented",
  "results-driven", "self-starter", "fast learner", "think outside the box",
  "synergy", "dynamic", "passionate", "thought leader", "cutting-edge",
  "value add", "ninja", "rockstar", "guru", "strategic thinker",
  "proven track record", "highly motivated", "proactive", "punctual"
];

const WEAK_PATTERNS = [
  { regex: /\b(worked on)\b/gi, label: "worked on" },
  { regex: /\b(responsible for)\b/gi, label: "responsible for" },
  { regex: /\b(helped with|assisted with|assisted in)\b/gi, label: "assisted with" },
  { regex: /\b(familiar with)\b/gi, label: "familiar with" },
  { regex: /\b(handled)\b/gi, label: "handled" },
  { regex: /\b(duties included)\b/gi, label: "duties included" },
];

export const analyzeResumeLocally = (resumeText = "") => {
  const text = (resumeText || "").trim();
  const lower = text.toLowerCase();

  // 1. Detect present & missing sections
  const sectionChecks = [
    { name: "Professional Summary", pattern: /\b(summary|profile|about me|objective)\b/ },
    { name: "Work Experience", pattern: /\b(experience|employment|work history|work experience)\b/ },
    { name: "Projects", pattern: /\b(projects?|personal projects|key projects)\b/ },
    { name: "Skills", pattern: /\b(skills?|technical skills|technologies|proficiencies)\b/ },
    { name: "Education", pattern: /\b(education|academic background|degree|university|college)\b/ },
    { name: "Certifications", pattern: /\b(certifications?|certificates|licenses)\b/ },
    { name: "Awards or Honors", pattern: /\b(awards?|honors?|achievements?|scholarships?)\b/ },
  ];

  const missing_sections = [];
  const presentSections = [];

  for (const sec of sectionChecks) {
    if (sec.pattern.test(lower)) {
      presentSections.push(sec.name);
    } else {
      missing_sections.push(sec.name);
    }
  }

  // 2. Detect Action Verbs
  const action_verbs_found = new Set();
  for (const verb of ACTION_VERB_LIST) {
    const rx = new RegExp(`\\b${verb}\\b`, "i");
    if (rx.test(lower)) {
      action_verbs_found.add(verb.charAt(0).toUpperCase() + verb.slice(1));
    }
  }
  const action_verbs = Array.from(action_verbs_found).slice(0, 12);

  // 3. Detect Buzzwords
  const buzzwords_found = new Set();
  for (const buzz of BUZZWORD_LIST) {
    const rx = new RegExp(`\\b${buzz}\\b`, "i");
    if (rx.test(lower)) {
      buzzwords_found.add(buzz.charAt(0).toUpperCase() + buzz.slice(1));
    }
  }
  const buzzwords = Array.from(buzzwords_found);

  // 4. Detect Repeated / Weak Phrases
  const repeated_phrases_found = new Set();
  for (const weak of WEAK_PATTERNS) {
    const matches = lower.match(weak.regex);
    if (matches && matches.length >= 1) {
      repeated_phrases_found.add(`"${weak.label}" (${matches.length}x)`);
    }
  }
  const repeated_phrases = Array.from(repeated_phrases_found);

  // 5. Evaluate Metrics / Numbers
  const metricMatches = text.match(/\d+[%kKmM+]|\$\d+|\b\d{2,}\b/g) || [];
  const hasStrongMetrics = metricMatches.length >= 3;

  // 6. Contact Details Checks
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text);
  const hasLinkedIn = /linkedin\.com/i.test(text);
  const hasGitHub = /github\.com/i.test(text);

  // 7. Calculate realistic ATS score
  let score = 52;

  // Section completeness
  if (presentSections.includes("Work Experience") || presentSections.includes("Projects")) score += 10;
  if (presentSections.includes("Skills")) score += 8;
  if (presentSections.includes("Education")) score += 6;
  if (presentSections.includes("Professional Summary")) score += 5;
  if (presentSections.includes("Certifications")) score += 4;
  if (presentSections.includes("Awards or Honors")) score += 3;

  // Verbs & Metrics
  score += Math.min(action_verbs.length * 1.5, 9);
  if (hasStrongMetrics) score += 6;
  if (hasLinkedIn || hasGitHub) score += 4;

  // Penalties
  if (buzzwords.length > 2) score -= 3;
  if (repeated_phrases.length > 1) score -= 3;
  if (!hasEmail) score -= 5;

  const ats_score = Math.max(45, Math.min(94, Math.round(score)));

  // 8. Generate contextual improvement suggestions
  const suggestions = [];

  if (!hasStrongMetrics) {
    suggestions.push(
      "Quantify your accomplishments: Add measurable numbers, percentages, or scale (e.g., 'improved performance by 25%', 'served 10,000+ users')."
    );
  }

  if (repeated_phrases.length > 0) {
    suggestions.push(
      `Replace passive phrases like ${repeated_phrases.slice(0, 2).join(" or ")} with high-impact action verbs (e.g., Spearheaded, Engineered, Orchestrated).`
    );
  } else if (action_verbs.length < 5) {
    suggestions.push(
      "Incorporate more authoritative action verbs at the beginning of each bullet point (e.g., 'Architected', 'Implemented', 'Deployed')."
    );
  }

  if (missing_sections.includes("Certifications")) {
    suggestions.push(
      "Add a Certifications or Licenses section to boost ATS keyword matching for industry-recognized credentials."
    );
  }

  if (missing_sections.includes("Professional Summary")) {
    suggestions.push(
      "Include a concise 2-3 line Professional Summary at the top to give recruiters an immediate snapshot of your core expertise."
    );
  }

  if (!hasLinkedIn || !hasGitHub) {
    suggestions.push(
      "Include clickable links to your LinkedIn profile and GitHub portfolio in the header to increase recruiter engagement."
    );
  }

  if (buzzwords.length > 0) {
    suggestions.push(
      `Eliminate generic buzzwords (${buzzwords.slice(0, 3).join(", ")}) and demonstrate those qualities through concrete project outcomes instead.`
    );
  }

  if (suggestions.length < 3) {
    suggestions.push(
      "Tailor technical keywords and framework names to match specific job descriptions you are targeting."
    );
    suggestions.push(
      "Keep bullet points concise (1 to 2 lines each) using the Action Verb + Context + Result formula."
    );
  }

  // 9. Tone Analysis
  let tone_analysis = "Professional & Technical";
  if (action_verbs.length >= 6 && hasStrongMetrics) {
    tone_analysis = "High-Impact & Results-Oriented: Strong engineering presence with clear focus on measurable outcomes.";
  } else if (action_verbs.length >= 4) {
    tone_analysis = "Technical & Structured: Clean and objective tone that effectively communicates your background and skills.";
  } else {
    tone_analysis = "Descriptive & Task-Focused: Communicates responsibilities well; shifting to active leadership verbs will enhance recruiter impact.";
  }

  // 10. Final Verdict Summary
  let verdict_summary = "";
  if (ats_score >= 80) {
    verdict_summary = `Strong ATS compatibility score (${ats_score}/100). The resume demonstrates clear technical competence and good structure. Implementing the suggestions above will maximize recruiter interview conversion.`;
  } else if (ats_score >= 65) {
    verdict_summary = `Solid foundation (${ats_score}/100) with good core skills. Incorporating measurable business impact metrics and strengthening bullet points will elevate this resume into the top percentile.`;
  } else {
    verdict_summary = `Good starting draft (${ats_score}/100). Adding structured sections (Summary, Certifications) and replacing passive language with strong action verbs will substantially boost your ATS ranking.`;
  }

  // 11. Detect Eligible Roles from skills/tech stack mentioned in resume
  const rolePatterns = [
    { pattern: /\b(react|vue|angular|svelte|next\.?js|html|css|tailwind)\b/i, role: "Frontend Developer" },
    { pattern: /\b(node\.?js|express|django|flask|fastapi|spring|rails)\b/i, role: "Backend Developer" },
    { pattern: /\b(full.?stack|mern|mean|lamp)\b/i, role: "Full Stack Developer" },
    { pattern: /\b(python|data science|pandas|numpy|scikit|matplotlib)\b/i, role: "Data Scientist" },
    { pattern: /\b(machine learning|deep learning|tensorflow|pytorch|keras|nlp)\b/i, role: "ML Engineer" },
    { pattern: /\b(sql|postgresql|mysql|mongodb|power bi|tableau|excel|bi)\b/i, role: "Data Analyst" },
    { pattern: /\b(aws|azure|gcp|google cloud|cloud|ec2|s3|lambda)\b/i, role: "Cloud Engineer" },
    { pattern: /\b(docker|kubernetes|ci\/cd|jenkins|terraform|devops|ansible)\b/i, role: "DevOps Engineer" },
    { pattern: /\b(android|kotlin|java mobile)\b/i, role: "Android Developer" },
    { pattern: /\b(ios|swift|objective-c|xcode)\b/i, role: "iOS Developer" },
    { pattern: /\b(flutter|react native|xamarin|ionic)\b/i, role: "Mobile App Developer" },
    { pattern: /\b(ui|ux|figma|sketch|adobe xd|user experience|design)\b/i, role: "UI/UX Designer" },
    { pattern: /\b(cybersecurity|penetration testing|ethical hacking|soc|siem)\b/i, role: "Security Engineer" },
    { pattern: /\b(blockchain|solidity|ethereum|web3|smart contract)\b/i, role: "Blockchain Developer" },
    { pattern: /\b(java|j2ee|spring boot|hibernate)\b/i, role: "Java Developer" },
    { pattern: /\b(c\+\+|c#|\.net|unity|game)\b/i, role: ".NET / Game Developer" },
  ];

  const eligible_roles = [];
  for (const { pattern, role } of rolePatterns) {
    if (pattern.test(lower) && !eligible_roles.includes(role)) {
      eligible_roles.push(role);
    }
    if (eligible_roles.length >= 6) break;
  }

  return {
    ats_score,
    suggestions: suggestions.slice(0, 5),
    buzzwords: buzzwords.slice(0, 6),
    missing_sections,
    action_verbs: action_verbs.slice(0, 10),
    repeated_phrases: repeated_phrases.slice(0, 6),
    tone_analysis,
    verdict_summary,
    eligible_roles,
  };
};

