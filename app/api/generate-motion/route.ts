import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Comprehensive list of 100 debate motions
    const debateMotions = [
      // Technology & AI (10)
      "This House believes that artificial intelligence will do more harm than good to society.",
      "This House would ban the development of autonomous weapons systems.",
      "This House supports the implementation of universal basic income.",
      "This House believes that social media has done more harm than good to democracy.",
      "This House would ban facial recognition technology in public spaces.",
      "This House believes that robots should have legal rights.",
      "This House would ban smartphones for children under 16.",
      "This House supports the right to digital privacy for all citizens.",
      "This House believes that automation will increase unemployment.",
      "This House would require algorithms to be transparent and explainable.",
      
      // Environment & Climate (10)
      "This House would ban single-use plastics worldwide.",
      "This House supports nuclear energy as a solution to climate change.",
      "This House would impose a carbon tax on all industries.",
      "This House believes that individual actions are more important than government policies in fighting climate change.",
      "This House would ban private car ownership in cities.",
      "This House supports the construction of new nuclear power plants.",
      "This House would ban factory farming to protect the environment.",
      "This House believes that developed countries should pay reparations for climate change.",
      "This House would make climate change denial illegal.",
      "This House supports geoengineering to combat global warming.",
      
      // Politics & Governance (10)
      "This House believes that democracy is the best form of government.",
      "This House would implement mandatory voting in all elections.",
      "This House supports the abolition of the death penalty worldwide.",
      "This House believes that privacy is more important than national security.",
      "This House would limit the terms of all political leaders.",
      "This House would lower the voting age to 16.",
      "This House supports the implementation of proportional representation.",
      "This House believes that politicians should be selected by lottery.",
      "This House would ban political donations from corporations.",
      "This House supports the dissolution of the United Nations.",
      
      // Education & Society (10)
      "This House believes that standardized testing should be abolished.",
      "This House supports free university education for all citizens.",
      "This House believes that homeschooling should be banned.",
      "This House would make philosophy a compulsory subject in schools.",
      "This House believes that traditional classroom education is outdated.",
      "This House would ban homework for all students.",
      "This House supports the teaching of creationism in schools.",
      "This House believes that universities should be free for all.",
      "This House would replace grades with pass/fail systems.",
      "This House supports year-round schooling.",
      
      // Economics & Business (10)
      "This House would break up big technology monopolies.",
      "This House supports a four-day work week.",
      "This House believes that remote work is better than office work for productivity.",
      "This House would implement a maximum wage for all workers.",
      "This House supports the abolition of intellectual property rights.",
      "This House would ban cryptocurrencies.",
      "This House supports a global minimum wage.",
      "This House believes that capitalism is the best economic system.",
      "This House would ban child labor worldwide.",
      "This House supports the nationalization of essential services.",
      
      // Health & Science (10)
      "This House would ban genetic engineering in humans.",
      "This House believes that vaccination should be mandatory for all children.",
      "This House supports the legalization of all drugs.",
      "This House would ban animal testing for cosmetic products.",
      "This House believes that healthcare should be free for everyone.",
      "This House would ban the sale of tobacco products.",
      "This House supports mandatory organ donation.",
      "This House believes that gene editing should be banned in humans.",
      "This House would ban advertising for prescription drugs.",
      "This House supports euthanasia for terminally ill patients.",
      
      // International Relations (10)
      "This House believes that borders should be open.",
      "This House supports the abolition of all nuclear weapons.",
      "This House would end all foreign military interventions.",
      "This House believes that economic sanctions are more harmful than helpful.",
      "This House supports a world government.",
      "This House would withdraw from all international treaties.",
      "This House believes that immigration strengthens national economies.",
      "This House supports the right of nations to self-determination.",
      "This House would ban arms sales to authoritarian regimes.",
      "This House believes that humanitarian intervention is justified.",
      
      // Ethics & Philosophy (10)
      "This House believes that lying is always morally wrong.",
      "This House would ban all forms of gambling.",
      "This House believes that happiness is more important than achievement.",
      "This House supports the right to die with dignity.",
      "This House believes that religion does more harm than good.",
      "This House would ban the death penalty for all crimes.",
      "This House believes that moral absolutism is superior to moral relativism.",
      "This House supports the legalization of assisted suicide.",
      "This House would ban animal captivity for entertainment.",
      "This House believes that free will is an illusion.",
      
      // Media & Culture (10)
      "This House would ban violent video games.",
      "This House believes that cancel culture is harmful to society.",
      "This House supports government funding for the arts.",
      "This House would ban advertising to children.",
      "This House believes that diversity quotas should be mandatory in all organizations.",
      "This House would ban reality television.",
      "This House supports net neutrality.",
      "This House believes that journalism should be regulated by the government.",
      "This House would ban hate speech on social media.",
      "This House supports the public funding of news organizations.",
      
      // Crime & Justice (10)
      "This House would abolish all prisons.",
      "This House believes that police should be defunded.",
      "This House supports the legalization of all victimless crimes.",
      "This House would ban private prisons.",
      "This House believes that restorative justice is superior to punitive justice.",
      "This House would end the war on drugs.",
      "This House supports the decriminalization of all drugs.",
      "This House believes that criminals should be rehabilitated rather than punished.",
      "This House would ban capital punishment worldwide.",
      "This House supports gun control legislation."
    ];

    // Select a random motion instantly
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