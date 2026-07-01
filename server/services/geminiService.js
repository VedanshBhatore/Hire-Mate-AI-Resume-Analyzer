const analyzeResumeWithAI = async (resumeText, jobDescription = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
  const prompt = `
You are an expert ATS resume analyzer and career coach.

Analyze the following resume${jobDescription ? ' against the provided job description' : ''} and provide detailed, actionable feedback.

RESUME:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}

Respond ONLY with a valid JSON object in exactly this format (no markdown, no backticks):
{
  "overallFeedback": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "missingKeywords": ["keyword1", "keyword2"],
  "formattingTips": ["tip 1", "tip 2"],
  "jobMatch": ${jobDescription ? 'a number from 0-100' : 'null'}
}
`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

module.exports = { analyzeResumeWithAI };