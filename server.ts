import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());

// Lazy-initialize Google Gen AI to prevent app crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Generate AI prescription recommendation
app.post('/api/generate-prescription', async (req, res) => {
  try {
    const { symptoms, diagnosis, vitals } = req.body;
    
    const client = getAIClient();
    const prompt = `
      You are an expert AI medical assistant for a Hospital and Diagnostic Management Software in Bangladesh.
      Based on the following patient details, suggest appropriate medications, advice, and instructions in Bengali.
      
      Patient Vitals:
      - Blood Pressure: ${vitals?.bp || 'N/A'}
      - Temperature: ${vitals?.temp || 'N/A'}
      - Weight: ${vitals?.weight || 'N/A'}
      Pulse: ${vitals?.pulse || 'N/A'}
      
      Symptoms (লক্ষণ):
      ${symptoms || 'None reported'}
      
      Diagnosis (রোগের ধরন):
      ${diagnosis || 'Under evaluation'}
      
      You must respond strictly with a valid JSON object matching the following TypeScript interface structure (do not include markdown wrapping like \`\`\`json):
      {
        "medicines": [
          {
            "name": "Medicine Name (e.g., Napa Extend 665mg)",
            "dosage": "Dosage representation in standard format (e.g., 1+0+1 or 1+1+1)",
            "instruction": "Instructions in Bengali (e.g., খাবারের পর or খাবারের আগে)",
            "duration": "Duration in Bengali (e.g., ৫ দিন)"
          }
        ],
        "advice": "General medical advice in Bengali (e.g., পর্যাপ্ত পানি পান করুন, বিশ্রাম নিন)"
      }
      
      Ensure the response is medically safe, helpful, and written clearly in Bengali for a patient to understand.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    // Parse to ensure it is valid JSON, then return
    try {
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', responseText);
      return res.status(500).json({
        error: 'AI response parsing failed',
        rawText: responseText
      });
    }
  } catch (error: any) {
    console.error('AI prescription helper error:', error);
    res.status(500).json({ error: error.message || 'AI request failed' });
  }
});

// API: Analyze symptoms and suggest next steps
app.post('/api/analyze-symptoms', async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms are required for analysis.' });
    }

    const client = getAIClient();
    const prompt = `
      You are an expert medical triage assistant.
      The patient has reported the following symptoms (লক্ষণ):
      "${symptoms}"

      Provide a comprehensive, easy-to-understand analysis in Bengali. Suggest:
      1. Possible causes (সম্ভাব্য কারণ)
      2. Recommended diagnostic tests or doctor specialty to consult (প্রস্তাবিত টেস্ট বা ডাক্তার)
      3. Critical warning signs to go to the emergency room immediately (জরুরী সতর্ক সংকেত)

      Format your output as a beautiful, neat JSON object (no markdown formatting, just pure JSON):
      {
        "causes": ["সম্ভাব্য কারণ ১", "সম্ভাব্য কারণ ২"],
        "recommendedTestsAndSpecialists": "প্রস্তাবিত পরামর্শ (বাংলায়)",
        "warningSigns": ["সতর্কতা ১", "সতর্কতা ২"],
        "disclaimer": "মেডিকেল ডিসক্লেইমার"
      }
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    try {
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'AI symptom checker response parse failed',
        rawText: responseText
      });
    }
  } catch (error: any) {
    console.error('AI symptom checker error:', error);
    res.status(500).json({ error: error.message || 'AI request failed' });
  }
});

// Vite Dev Middleware or Static Production Build handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for SPA routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
