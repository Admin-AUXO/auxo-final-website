export interface ContactContent {
  hero: {
    eyebrow: string;
    title: string;
    titleHighlight?: string | string[];
    description: string;
    pills: string[];
    primaryCtaText: string;
    secondaryCtaText: string;
    secondaryCtaHref: string;
  };
  useCases: {
    title: string;
    description: string;
    items: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  formSection: {
    title: string;
    description: string;
    checklist: string[];
    note: string;
  };
  faq: {
    title: string;
    description: string;
    items: {
      question: string;
      answer: string;
    }[];
  };
}

export const contactContent: ContactContent = {
  hero: {
    eyebrow: "Contact AUXO",
    title: "Bring the problem, not a polished brief",
    titleHighlight: ["problem", "not a polished brief"],
    description:
      "If reporting is messy, decisions are slow, or an analytics initiative is stuck, use this page. A short, honest summary is enough to start.",
    pills: [
      "Response within 1 business day",
      "Dubai-based, global delivery",
      "Form or direct email both work",
    ],
    primaryCtaText: "Schedule a Meeting",
    secondaryCtaText: "Go to form",
    secondaryCtaHref: "#contact-form-section",
  },
  useCases: {
    title: "Use this page when",
    description:
      "The best inquiries are not always the cleanest ones. Reach out when you need a recommendation, a scoped conversation, or a second opinion on what should happen first.",
    items: [
      {
        title: "You need the right starting point",
        description:
          "You know something in reporting, forecasting, automation, or analytics delivery is off, but not which service fits.",
        icon: "mdi:map-marker-path",
      },
      {
        title: "You already have a problem statement",
        description:
          "You want to discuss scope, timeline, and whether AUXO should handle a diagnostic, build, or retained role.",
        icon: "mdi:file-search-outline",
      },
      {
        title: "You want a partner, not another handoff",
        description:
          "You need senior-led analytics help that stays close to the business instead of disappearing behind vendor theater.",
        icon: "mdi:handshake",
      },
    ],
  },
  formSection: {
    title: "What to send us",
    description:
      "A useful first message usually answers three things. If you only have fragments, send the fragments.",
    checklist: [
      "What is breaking or slowing decisions right now?",
      "What teams, systems, or workflows are involved?",
      "What timeline, pressure, or constraint matters most?",
    ],
    note:
      "Messy context is fine. The point of the first conversation is to make the problem clearer, not to grade the brief.",
  },
  faq: {
    title: "Before you reach out",
    description:
      "These are the questions buyers usually ask before booking time or filling out the form.",
    items: [
      {
        question: "Do I need a full brief before contacting AUXO?",
        answer:
          "No. A clear description of the problem, the pressure around it, and the systems involved is enough for the first conversation.",
      },
      {
        question: "Should I book a meeting or use the form?",
        answer:
          "Either works. Use the form for a detailed written summary. Book a meeting if the issue is easier to explain live or timing is tight.",
      },
      {
        question: "Do you only work with teams in Dubai?",
        answer:
          "No. AUXO is based in Dubai, but engagements can run remotely, hybrid, or with targeted on-site time depending on the phase.",
      },
      {
        question: "What happens after I send a message?",
        answer:
          "You get a response within one business day. From there, AUXO will usually recommend a short call, a more scoped follow-up, or a direct answer on fit.",
      },
    ],
  },
};
