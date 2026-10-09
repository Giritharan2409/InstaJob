const axios = require('axios');

/**
 * Reusable AI service utilizing the Groq API.
 * Fallbacks to rules-based logic if GROQ_API_KEY is not defined.
 */
class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama3-8b-8192'; // High-speed, high-compatibility Groq model
  }

  async callGroq(systemPrompt, userPrompt, jsonMode = false) {
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey.includes('paste_your_groq_api_key_here')) {
      // API Key is not set or placeholder; return null to trigger fallback
      return null;
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: jsonMode ? { type: 'json_object' } : undefined,
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10s timeout
        }
      );

      const content = response.data.choices[0].message.content;
      return jsonMode ? JSON.parse(content) : content;
    } catch (error) {
      console.error('Error calling Groq API:', error.message);
      return null; // Trigger local fallback on API error
    }
  }

  /**
   * Recommendation matching score between a worker profile and a job listing
   */
  async getMatchScore(worker, job) {
    const systemPrompt = `You are an expert recruitment system matching temporary workers with jobs. 
Analyze the worker's profile and the job description, and output a JSON object containing:
{
  "score": <number between 0 and 100>,
  "explanation": "<brief 1-2 sentence explanation of why they match or mismatch>"
}`;
    const userPrompt = `
Worker profile:
Name: ${worker.name}
Preferred Category: ${worker.preferredCategory}
Skills: ${worker.skills.join(', ')}
Bio: ${worker.bio || 'None'}
Trust Score: ${worker.trustScore}

Job details:
Title: ${job.title}
Category: ${job.category}
Description: ${job.description}
Skills Required: ${(job.skillsRequired || []).join(', ')}
Salary: $${job.salary}/hr
`;

    const result = await this.callGroq(systemPrompt, userPrompt, true);
    if (result && typeof result.score === 'number') {
      return result;
    }

    // Rules-based smart fallback
    let score = 50;
    const skillsMatched = worker.skills.filter(s => 
      job.skillsRequired.some(js => js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase()))
    );
    const categoryMatched = worker.preferredCategory.toLowerCase() === job.category.toLowerCase();

    if (categoryMatched) score += 25;
    score += skillsMatched.length * 10;
    if (worker.trustScore >= 95) score += 10;
    if (score > 98) score = 98; // cap it

    let explanation = '';
    if (categoryMatched) {
      explanation = `Matched preferred category '${job.category}'. Has ${skillsMatched.length} matching skills: [${skillsMatched.join(', ')}].`;
    } else {
      explanation = `Category mismatch, but matches ${skillsMatched.length} skills. Good compatibility based on performance background.`;
    }

    return { score, explanation };
  }

  /**
   * Analyze job details for fake posting risk
   */
  async checkFakeJob(jobDetails) {
    const systemPrompt = `You are a fraud detection AI. Analyze the job posting for anomalies such as unrealistic salary ($500+/hr for simple jobs), vague contact info, suspicious requests (e.g. paying upfront fees), and mismatched details.
Output a JSON object containing:
{
  "fakeScore": <number between 0 and 100 representing risk of being fake/scam>,
  "analysis": "<brief warning details or why it looks authentic>"
}`;
    const userPrompt = `
Job Title: ${jobDetails.title}
Category: ${jobDetails.category}
Description: ${jobDetails.description}
Salary: $${jobDetails.salary}/hr
Vacancies: ${jobDetails.vacancies}
Contact: ${jobDetails.contactPerson}
`;

    const result = await this.callGroq(systemPrompt, userPrompt, true);
    if (result && typeof result.fakeScore === 'number') {
      return result;
    }

    // Smart local fallback
    let fakeScore = 10;
    let reasons = [];

    const desc = (jobDetails.description || '').toLowerCase();
    const title = (jobDetails.title || '').toLowerCase();

    if (jobDetails.salary > 200) {
      fakeScore += 45;
      reasons.push('Unusually high salary for temporary work');
    }
    if (desc.includes('pay upfront') || desc.includes('deposit') || desc.includes('registration fee')) {
      fakeScore += 40;
      reasons.push('Mentions upfront fees or deposits');
    }
    if (desc.includes('whatsapp only') || desc.includes('telegram only')) {
      fakeScore += 15;
      reasons.push('Redirects to personal messaging apps');
    }
    if (desc.length < 30) {
      fakeScore += 10;
      reasons.push('Very short, vague job description');
    }

    if (fakeScore > 95) fakeScore = 95;

    const analysis = reasons.length > 0 
      ? `Warnings flagged: ${reasons.join(', ')}.` 
      : 'Looks authentic. Standard temporary job parameters detected.';

    return { fakeScore, analysis };
  }

  /**
   * AI Career Guidance & Recommendations
   */
  async getCareerGuidance(worker) {
    const systemPrompt = `You are an AI career coach for students and temporary workers.
Based on the user's skills and preferences, output a HTML/markdown response (without outer wrappers) containing:
1. Three high-demand roles they should explore.
2. Recommended skills to learn next.
3. Resume improvement tips.`;
    const userPrompt = `
Worker profile:
Name: ${worker.name}
Preferred Category: ${worker.preferredCategory}
Skills: ${worker.skills.join(', ')}
Bio: ${worker.bio || 'None'}
`;

    const result = await this.callGroq(systemPrompt, userPrompt, false);
    if (result) return result;

    // Local fallback
    return `
<h3>AI Career Recommendations for ${worker.name}</h3>
<p>Based on your interest in <strong>${worker.preferredCategory}</strong> and your skills in <em>${worker.skills.join(', ')}</em>, here are your personalized recommendations:</p>
<div class="space-y-3 mt-2 text-sm text-gray-300">
  <p><strong>1. Recommended Roles to Explore:</strong> Freelance developer, Junior Event coordinator, or Tech-support assistant.</p>
  <p><strong>2. Next Skills to Learn:</strong> Advanced React state management (Redux/Zustand), UI/UX wireframing (Figma), or basic Node.js API development.</p>
  <p><strong>3. Quick Resume Tip:</strong> Add a dedicated section highlighting your temporary gigs. Employers value reliability, prompt attendance, and swift task execution!</p>
</div>
`;
  }

  /**
   * AI Resume Builder
   */
  async generateResume(worker) {
    const systemPrompt = `You are a professional resume creator. Based on the user's skills and info, generate a structured text resume including Summary, Skills, Suggested Experience, and Projects. Keep it concise.`;
    const userPrompt = `
Name: ${worker.name}
Phone: ${worker.phone}
Email: ${worker.email}
Category Preference: ${worker.preferredCategory}
Skills: ${worker.skills.join(', ')}
Bio: ${worker.bio}
`;

    const result = await this.callGroq(systemPrompt, userPrompt, false);
    if (result) return result;

    // Local fallback
    return `
=========================================
          ${worker.name.toUpperCase()}
=========================================
Email: ${worker.email} | Phone: ${worker.phone}
Category: ${worker.preferredCategory}

PROFESSIONAL SUMMARY
Reliable and motivated professional focusing on ${worker.preferredCategory} opportunities. Proven track record of high-punctuality performance (Trust Score: ${worker.trustScore}%) on short-term tasks.

TECHNICAL & SOFT SKILLS
* ${worker.skills.join('\n* ')}

EXPERIENCE (SIMULATED & COMPLETED GIGS)
* Insta Job Partner | Short-Term Assistant
  - Successfully executed event coordination and technical tasks.
  - Consistent attendance and fast feedback approval from employers.

EDUCATION & CERTIFICATIONS
* Digital work credentials verified via Insta Job platform.
=========================================
`;
  }

  /**
   * AI Salary Suggestion
   */
  async getSalarySuggestion(jobTitle, skills) {
    const systemPrompt = `You are a salary estimator. Based on the job title and skills, output a single JSON object containing:
{
  "suggestedMin": <number hourly rate>,
  "suggestedMax": <number hourly rate>,
  "reason": "<1 sentence reasoning>"
}`;
    const userPrompt = `Job Title: ${jobTitle}, Skills Required: ${skills.join(', ')}`;
    
    const result = await this.callGroq(systemPrompt, userPrompt, true);
    if (result && typeof result.suggestedMin === 'number') {
      return result;
    }

    // Fallback salary estimator
    let suggestedMin = 15;
    let suggestedMax = 25;
    let reason = "Standard rates for basic temporary tasks.";

    const title = jobTitle.toLowerCase();
    if (title.includes('develop') || title.includes('program') || title.includes('tech') || title.includes('code')) {
      suggestedMin = 35;
      suggestedMax = 65;
      reason = "Premium tech rates based on specialized coding knowledge requirements.";
    } else if (title.includes('design') || title.includes('media') || title.includes('marketing')) {
      suggestedMin = 25;
      suggestedMax = 45;
      reason = "Standard creative and marketing assistant rates in metropolitan hubs.";
    } else if (title.includes('delivery') || title.includes('shift') || title.includes('warehouse')) {
      suggestedMin = 18;
      suggestedMax = 28;
      reason = "Standard logistical support rates with physical effort premiums.";
    }

    return { suggestedMin, suggestedMax, reason };
  }
}

module.exports = new AIService();
