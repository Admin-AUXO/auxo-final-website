export interface AboutContent {
  hero: {
    headline: string;
    description: string;
    ctaText: string;
    ctaHref: string;
  };
  mission: {
    title: string;
    mission: string;
    missionHighlight?: string | string[];
    vision: string;
    visionHighlight?: string | string[];
  };
  purpose: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    nameOrigin: {
      title: string;
      description: string;
      descriptionHighlight?: string | string[];
    };
  };
  approach: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    principles: {
      letter: string;
      title: string;
      description: string;
      descriptionHighlight?: string | string[];
    }[];
  };
  team: {
    title: string;
    description: string;
    leadership: {
      name: string;
      role: string;
      bio: string;
    }[];
    advisors: {
      name: string;
      role: string;
      bio: string;
    }[];
  };
  partnership: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
  };
  global: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
  };
  cta: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    ctaText: string;
    ctaHref: string;
  };
}

export const aboutContent: AboutContent = {
  hero: {
    headline: "We bridge business strategy and data execution",
    description: "AUXO Data Labs exists to make analytics a practical, everyday advantage—not an aspirational slide in a board deck.",
    ctaText: "View our Principles",
    ctaHref: "#approach",
  },
  mission: {
    title: "Mission & Vision",
    mission: "To make intelligence effortless — a world where every decision is clear, confident, and precise",
    missionHighlight: ['effortless', 'precise'],
    vision: "To engineer practical data systems and ways of working that turn complexity into simple, reliable decisions for every team, every day",
    visionHighlight: ['practical data systems', 'reliable decisions'],
  },
  purpose: {
    title: "What We Do",
    description: "AUXO is a modern analytics consultancy that blends deep business understanding with hands‑on data engineering and data science to help organizations move from raw data to confident, compliant decisions.",
    descriptionHighlight: ['deep business understanding', 'confident, compliant decisions'],
    nameOrigin: {
      title: "Why AUXO",
      description: "The name AUXO comes from the idea of augmentation—support that amplifies what is already there rather than trying to replace it. The role is to plug into existing teams, tools, and ambitions, then sharpen priorities, strengthen data foundations, and accelerate how quickly questions turn into answers. It reflects a simple idea: sustainable growth comes from intelligent support and focus, not from adding more noise or complexity.",
      descriptionHighlight: ['augmentation', 'sustainable growth'],
    },
  },
  approach: {
    title: "We Follow the CODE",
    description: "We combine consulting discipline with a build‑first delivery model, anchored in decisions—not hype—so you move fast without losing rigor or control.",
    descriptionHighlight: ['decisions—not hype'],
    principles: [
      {
        letter: "C",
        title: "Center",
        description: "Center every engagement on a sharp set of decisions and outcomes before touching the tooling.",
        descriptionHighlight: ['decisions and outcomes'],
      },
      {
        letter: "O",
        title: "Organize",
        description: "Organize data, architecture, and workflows into simple, coherent structures that make analytics feel intuitive, not overwhelming.",
        descriptionHighlight: ['coherent structures'],
      },
      {
        letter: "D",
        title: "Develop",
        description: "Develop capability in client teams by working side by side, handing over patterns and ownership instead of just deliverables.",
        descriptionHighlight: ['working side by side'],
      },
      {
        letter: "E",
        title: "Ensure",
        description: "Ensure trust by treating governance, security, compliance, and measurement as design constraints, not afterthoughts.",
        descriptionHighlight: ['design constraints'],
      },
    ],
  },
  team: {
    title: "Who Is Behind AUXO",
    description: "The team brings together consultants, data engineers, and data scientists with experience across high‑growth startups and global enterprises. People here speak both commercial and technical languages, keeping stakeholders aligned from whiteboard to production.",
    leadership: [],
    advisors: [],
  },
  partnership: {
    title: "A Partner, Not Just a Vendor",
    description: "The approach is to plug into organizations as an extension of the existing team, not a separate black box. Stakeholders stay close to the work through regular rituals—working sessions, demos, and steering forums—so there are fewer surprises and faster iteration. Solutions are designed to match the way the business actually runs, which makes adoption and long‑term ownership much easier.",
    descriptionHighlight: ['extension of the existing team', 'long‑term ownership'],
  },
  global: {
    title: "Global Mindset, Local Context",
    description: "Based in Dubai with a global outlook, the team supports clients across regions and time zones. Engagements can be fully remote or hybrid, with on‑site time reserved for the moments that matter most: workshops, key milestones, and change management.",
    descriptionHighlight: ['across regions and time zones', 'moments that matter most'],
  },
  cta: {
    title: "Explore a Partnership",
    description: "If this vision resonates, share your goals and constraints. You'll leave with a clear view of whether a Strategy Blueprint, targeted project, or long‑term partnership fits best.",
    descriptionHighlight: ['clear view', 'long‑term partnership'],
    ctaText: "Book a discovery call",
    ctaHref: "/contact/",
  },
};

