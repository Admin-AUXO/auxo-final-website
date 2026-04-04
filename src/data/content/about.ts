export interface AboutContent {
  hero: {
    eyebrow: string;
    title: string;
    titleHighlight?: string | string[];
    description: string;
    pills: string[];
    primaryCtaText: string;
    primaryCtaHref: string;
    secondaryCtaText: string;
    secondaryCtaHref: string;
  };
  mission: {
    title: string;
    missionText: string;
    missionHighlight?: string | string[];
    visionText: string;
    visionHighlight?: string | string[];
  };
  purpose: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    capabilities: {
      title: string;
      description: string;
      icon: string;
    }[];
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
    profiles: {
      title: string;
      focus: string;
      description: string;
      icon: string;
    }[];
    note: string;
  };
  partnership: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    commitments: {
      title: string;
      description: string;
      icon: string;
    }[];
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
    eyebrow: "About AUXO",
    title: "Decision intelligence without the consulting theater",
    titleHighlight: ["without the consulting theater"],
    description:
      "AUXO Data Labs is a Dubai-based analytics partner for teams that need clearer reporting, stronger data foundations, and faster operational decisions. We work between business context and technical delivery so analytics changes how the business actually runs.",
    pills: [
      "Dubai-based, global delivery",
      "Senior-led execution",
      "Build-first, not slide-first",
    ],
    primaryCtaText: "See how we work",
    primaryCtaHref: "#approach",
    secondaryCtaText: "Start a conversation",
    secondaryCtaHref: "/contact/",
  },
  mission: {
    title: "What AUXO Is Built To Fix",
    missionText:
      "Too many organizations invest in data work without getting faster, clearer decisions. AUXO exists to close that gap by turning analytics effort into operational advantage.",
    missionHighlight: ["faster, clearer decisions", "operational advantage"],
    visionText:
      "Analytics should be easier to trust, easier to use, and easier for business teams to own after delivery.",
    visionHighlight: ["easier to trust", "easier for business teams to own"],
  },
  purpose: {
    title: "What Clients Rely On AUXO For",
    description:
      "Clients usually come to AUXO when analytics has become slow, fragmented, or too abstract to help the people running the business.",
    descriptionHighlight: ["slow, fragmented", "people running the business"],
    capabilities: [
      {
        title: "Diagnose Before Building",
        description:
          "Clarify the operating problem, decision pressure, and ownership gaps before prescribing platforms or features.",
        icon: "mdi:magnify-scan",
      },
      {
        title: "Build the Right System",
        description:
          "Design reporting, forecasting, automation, and decision workflows that match how the business actually reviews and acts.",
        icon: "mdi:cog-transfer-outline",
      },
      {
        title: "Leave Real Capability Behind",
        description:
          "Transfer structure, standards, and working patterns so the team can run the system after delivery instead of depending on a black box.",
        icon: "mdi:school-outline",
      },
    ],
    nameOrigin: {
      title: "Why the name AUXO?",
      description:
        "AUXO comes from the Greek root for growth. It is a reminder that better analytics should produce practical momentum, not just more dashboards.",
      descriptionHighlight: ["growth", "practical momentum"],
    },
  },
  approach: {
    title: "How We Work",
    description:
      "The operating model is simple: clarify the decision, structure the data and workflow, build the right system, and leave the team stronger than we found it.",
    descriptionHighlight: ["clarify the decision", "leave the team stronger"],
    principles: [
      {
        letter: "C",
        title: "Center the Decision",
        description:
          "Start with the business choice, management rhythm, or operating bottleneck that matters. Tooling comes after the decision logic is clear.",
        descriptionHighlight: ["business choice", "Tooling comes after"],
      },
      {
        letter: "O",
        title: "Organize the System",
        description:
          "Bring data, definitions, ownership, and workflow into a cleaner structure so reporting and delivery stop fighting each other.",
        descriptionHighlight: ["cleaner structure"],
      },
      {
        letter: "D",
        title: "Deliver in the Open",
        description:
          "Work with stakeholders directly through working sessions, reviews, and visible tradeoffs so there are fewer surprises and less rework.",
        descriptionHighlight: ["fewer surprises and less rework"],
      },
      {
        letter: "E",
        title: "Embed the Capability",
        description:
          "Design for adoption, governance, and ownership from the start so the result survives contact with the business calendar.",
        descriptionHighlight: ["adoption, governance, and ownership"],
      },
    ],
  },
  team: {
    title: "How AUXO Is Built",
    description:
      "Engagements are designed around a mixed operating team rather than a single specialist lane. That keeps commercial context, technical quality, and adoption pressure in the same room.",
    profiles: [
      {
        title: "Strategy and Operating Context",
        focus: "What needs to change",
        description:
          "Translate management pain, reporting routines, and operational constraints into a clear problem definition and execution path.",
        icon: "mdi:briefcase-outline",
      },
      {
        title: "Data Engineering and Systems",
        focus: "What needs to work",
        description:
          "Handle the modeling, pipeline, performance, and control work that keeps reporting, forecasting, and automation dependable.",
        icon: "mdi:database-cog",
      },
      {
        title: "Decision Enablement and Adoption",
        focus: "What needs to stick",
        description:
          "Turn delivered work into something leaders and operators can actually use, review, govern, and carry forward.",
        icon: "mdi:account-group-outline",
      },
    ],
    note:
      "Senior involvement stays close to the work. AUXO is not designed around bait-and-switch staffing or handoff theater.",
  },
  partnership: {
    title: "What It Feels Like To Work With AUXO",
    description:
      "AUXO is designed to operate like an embedded problem-solving partner, not a detached vendor queue.",
    descriptionHighlight: ["embedded problem-solving partner"],
    commitments: [
      {
        title: "Scoped to move",
        description:
          "Work is framed tightly enough to make progress quickly instead of disappearing into indefinite discovery.",
        icon: "mdi:compass-outline",
      },
      {
        title: "Transparent on tradeoffs",
        description:
          "We show the options, the constraints, and the consequences instead of hiding complexity behind jargon.",
        icon: "mdi:scale-balance",
      },
      {
        title: "Honest on fit",
        description:
          "If a diagnostic, build, or retained partnership is the wrong shape, AUXO will say so early.",
        icon: "mdi:shield-check-outline",
      },
    ],
  },
  global: {
    title: "Dubai Base, Broader Operating Range",
    description:
      "AUXO is based in Dubai and built for distributed delivery. Engagements can run remotely, hybrid, or on-site depending on the phase. Workshops, key design decisions, and executive alignment get the highest-bandwidth time. Build and iteration stay lean.",
    descriptionHighlight: ["distributed delivery", "Build and iteration stay lean"],
  },
  cta: {
    title: "Want to know whether AUXO is the right fit?",
    description:
      "Bring the reporting mess, system bottleneck, or operating question. You will get a clear view of where to start and whether AUXO is the right team for it.",
    descriptionHighlight: ["clear view", "right team"],
    ctaText: "Talk to AUXO",
    ctaHref: "/contact/",
  },
};
