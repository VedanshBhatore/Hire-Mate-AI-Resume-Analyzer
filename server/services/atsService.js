const calculateATSScore = (text) => {
  let score = 0;
  const feedback = {
    sections: {},
    keywords: {},
    formatting: {},
  };

  const lowerText = text.toLowerCase();

  const sections = {
    experience: ['experience', 'work experience', 'employment'],
    education: ['education', 'academic'],
    skills: ['skills', 'technical skills', 'technologies'],
    projects: ['projects', 'personal projects'],
    contact: ['email', 'phone', 'linkedin', 'github'],
    summary: ['summary', 'objective', 'profile'],
  };

  Object.entries(sections).forEach(([section, keywords]) => {
    const found = keywords.some((kw) => lowerText.includes(kw));
    feedback.sections[section] = found;
    if (found) score += section === 'contact' ? 10 : 6;
  });

  const actionVerbs = [
    'developed', 'built', 'designed', 'implemented', 'led',
    'managed', 'created', 'improved', 'achieved', 'delivered',
    'optimized', 'collaborated', 'engineered', 'launched', 'increased',
  ];
  const verbsFound = actionVerbs.filter((verb) => lowerText.includes(verb));
  const verbScore = Math.min(20, verbsFound.length * 2);
  score += verbScore;
  feedback.keywords.actionVerbs = verbsFound;

  const numberPattern = /\d+%|\d+x|\$\d+|\d+ (users|clients|teams|projects|months|years)/gi;
  const numbers = text.match(numberPattern) || [];
  const numberScore = Math.min(20, numbers.length * 5);
  score += numberScore;
  feedback.keywords.quantifiables = numbers;

  const wordCount = text.split(/\s+/).length;
  feedback.formatting.wordCount = wordCount;
  feedback.formatting.appropriateLength = wordCount >= 200 && wordCount <= 800;
  if (feedback.formatting.appropriateLength) score += 10;

  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /[\+]?[\d\s\-\(\)]{10,}/.test(text);
  feedback.formatting.hasEmail = hasEmail;
  feedback.formatting.hasPhone = hasPhone;
  if (hasEmail) score += 5;
  if (hasPhone) score += 5;

  return {
    score: Math.min(100, Math.round(score)),
    feedback,
  };
};

module.exports = { calculateATSScore };