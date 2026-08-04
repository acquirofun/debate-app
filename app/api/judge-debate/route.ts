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

    const { transcript, motion } = await req.json();

    if (!transcript || !motion) {
      return NextResponse.json(
        { error: 'Transcript and motion are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an impartial debate judge. Evaluate the following debate based on the transcript and motion provided.

Motion: "${motion}"

Transcript:
${transcript}

Please provide:
1. A detailed analysis of both sides' arguments
2. Strengths and weaknesses of each side
3. Scores for both teams (out of 100) based on:
   - Argument quality
   - Rebuttal effectiveness
   - Organization and clarity
   - Overall persuasiveness
4. A clear declaration of the winner
5. Brief constructive feedback for both sides

Format your response as JSON with this structure:
{
  "analysis": "Your detailed analysis",
  "affirmativeScore": number,
  "negativeScore": number,
  "winner": "Affirmative" or "Negative",
  "feedback": {
    "affirmative": "Feedback for affirmative",
    "negative": "Feedback for negative"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Try to parse the response as JSON
    try {
      const parsedResponse = JSON.parse(response);
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      // If parsing fails, return the raw text
      return NextResponse.json({ 
        analysis: response,
        affirmativeScore: 0,
        negativeScore: 0,
        winner: "Unable to determine",
        feedback: {
          affirmative: "See analysis above",
          negative: "See analysis above"
        }
      });
    }
  } catch (error) {
    console.error('Error judging debate:', error);
    return NextResponse.json(
      { error: 'Failed to judge debate' },
      { status: 500 }
    );
  }
}