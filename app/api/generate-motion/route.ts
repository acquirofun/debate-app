import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key present:', !!apiKey);
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      // Return a fallback motion if API key is not configured
      const fallbackMotions = [
        "This House believes that artificial intelligence will do more harm than good to society.",
        "This House would ban single-use plastics worldwide.",
        "This House believes that social media has done more harm than good to democracy.",
        "This House would implement universal basic income.",
        "This House believes that remote work is better than office work for productivity."
      ];
      const randomMotion = fallbackMotions[Math.floor(Math.random() * fallbackMotions.length)];
      return NextResponse.json({ motion: randomMotion });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate a single, high-level debate motion that is suitable for a formal debate. The motion should be:
- Clear and concise
- Balanced (both sides should have strong arguments)
- Relevant to current affairs or philosophical topics
- Suitable for a 5-minute preparation time

Return ONLY the motion text, no additional commentary or explanation.`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const motion = result.response.text().trim();
    console.log('Generated motion:', motion);

    return NextResponse.json({ motion });
  } catch (error) {
    console.error('Error generating motion:', error);
    // Return a fallback motion on error
    const fallbackMotions = [
      "This House believes that artificial intelligence will do more harm than good to society.",
      "This House would ban single-use plastics worldwide.",
      "This House believes that social media has done more harm than good to democracy.",
      "This House would implement universal basic income.",
      "This House believes that remote work is better than office work for productivity."
    ];
    const randomMotion = fallbackMotions[Math.floor(Math.random() * fallbackMotions.length)];
    return NextResponse.json({ motion: randomMotion });
  }
}