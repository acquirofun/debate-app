import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('AI Judge: API Key present:', !!apiKey);
    
    if (!apiKey) {
      console.error('AI Judge: GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured for AI Judge' },
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

    console.log('AI Judge: Starting evaluation for motion:', motion);
    console.log('AI Judge: Transcript length:', transcript.length);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an impartial debate judge. Evaluate the following debate based on the transcript and motion provided.

Motion: "${motion}"

Transcript:
${transcript}

Please provide:
1. A detailed analysis of both sides' arguments
2. Strengths and weaknesses of each side
3. Scores for both teams (out of 100) based on:
   - Argument quality (25 points)
   - Rebuttal effectiveness (25 points)
   - Organization and clarity (25 points)
   - Overall persuasiveness (25 points)
4. A clear declaration of the winner
5. Brief constructive feedback for both sides

Format your response as JSON with this structure:
{
  "analysis": "Your detailed analysis",
  "governmentScore": number,
  "oppositionScore": number,
  "winner": "Government" or "Opposition",
  "feedback": {
    "government": "Feedback for government",
    "opposition": "Feedback for opposition"
  }
}`;

    console.log('AI Judge: Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log('AI Judge: Received response');

    // Try to parse the response as JSON
    try {
      const parsedResponse = JSON.parse(response);
      console.log('AI Judge: Successfully parsed response');
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      console.error('AI Judge: Failed to parse JSON response:', parseError);
      // If parsing fails, return the raw text
      return NextResponse.json({ 
        analysis: response,
        governmentScore: 50,
        oppositionScore: 50,
        winner: "Tie",
        feedback: {
          government: "See analysis above",
          opposition: "See analysis above"
        }
      });
    }
  } catch (error) {
    console.error('AI Judge: Error judging debate:', error);
    return NextResponse.json(
      { error: 'Failed to judge debate' },
      { status: 500 }
    );
  }
}