import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Comprehensive list of debate motions
    const debateMotions = [
      // Technology & AI
      "This House believes that artificial intelligence will do more harm than good to society.",
      "This House would ban the development of autonomous weapons systems.",
      "This House supports the implementation of universal basic income.",
      "This House believes that social media has done more harm than good to democracy.",
      "This House would ban facial recognition technology in public spaces.",
      
      // Environment & Climate
      "This House would ban single-use plastics worldwide.",
      "This House supports nuclear energy as a solution to climate change.",
      "This House would impose a carbon tax on all industries.",
      "This House believes that individual actions are more important than government policies in fighting climate change.",
      "This House would ban private car ownership in cities.",
      
      // Politics & Governance
      "This House believes that democracy is the best form of government.",
      "This House would implement mandatory voting in all elections.",
      "This House supports the abolition of the death penalty worldwide.",
      "This House believes that privacy is more important than national security.",
      "This House would limit the terms of all political leaders.",
      
      // Education & Society
      "This House believes that standardized testing should be abolished.",
      "This House supports free university education for all citizens.",
      "This House believes that homeschooling should be banned.",
      "This House would make philosophy a compulsory subject in schools.",
      "This House believes that traditional classroom education is outdated.",
      
      // Economics & Business
      "This House would break up big technology monopolies.",
      "This House supports a four-day work week.",
      "This House believes that remote work is better than office work for productivity.",
      "This House would implement a maximum wage for all workers.",
      "This House supports the abolition of intellectual property rights.",
      
      // Health & Science
      "This House would ban genetic engineering in humans.",
      "This House believes that vaccination should be mandatory for all children.",
      "This House supports the legalization of all drugs.",
      "This House would ban animal testing for cosmetic products.",
      "This House believes that healthcare should be free for everyone.",
      
      // International Relations
      "This House believes that borders should be open.",
      "This House supports the abolition of all nuclear weapons.",
      "This House would end all foreign military interventions.",
      "This House believes that economic sanctions are more harmful than helpful.",
      "This House supports a world government.",
      
      // Ethics & Philosophy
      "This House believes that lying is always morally wrong.",
      "This House would ban all forms of gambling.",
      "This House believes that happiness is more important than achievement.",
      "This House supports the right to die with dignity.",
      "This House believes that religion does more harm than good.",
      
      // Media & Culture
      "This House would ban violent video games.",
      "This House believes that cancel culture is harmful to society.",
      "This House supports government funding for the arts.",
      "This House would ban advertising to children.",
      "This House believes that diversity quotas should be mandatory in all organizations."
    ];

    // Select a random motion
    const randomMotion = debateMotions[Math.floor(Math.random() * debateMotions.length)];
    
    console.log('Selected random motion:', randomMotion);
    
    return NextResponse.json({ motion: randomMotion });
  } catch (error) {
    console.error('Error generating motion:', error);
    return NextResponse.json(
      { error: 'Failed to generate motion' },
      { status: 500 }
    );
  }
}