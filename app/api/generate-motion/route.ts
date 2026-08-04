import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a single, high-level debate motion that is suitable for a formal debate. The motion should be:
- Clear and concise
- Balanced (both sides should have strong arguments)
- Relevant to current affairs or philosophical topics
- Suitable for a 5-minute preparation time

Return ONLY the motion text, no additional commentary or explanation.`;

    const result = await model.generateContent(prompt);
    const motion = result.response.text().trim();

    return NextResponse.json({ motion });
  } catch (error) {
    console.error('Error generating motion:', error);
    return NextResponse.json(
      { error: 'Failed to generate motion' },
      { status: 500 }
    );
  }
}