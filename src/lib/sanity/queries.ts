import groq from 'groq';

export const homepageQuery = groq`*[_type == "homepage"] | order(_updatedAt desc)[0]{
  hero {
    title,
    titleHighlight,
    subtitle,
    subtitleHighlight,
    primaryCta {
      text,
      href
    },
    scrollIndicator
  },
  problem {
    valueProposition
  },
  finalCta {
    title,
    subtitle,
    ctaText,
    ctaHref,
    body,
    bodyHighlight,
    reassuranceLine
  },
  methodology {
    title,
    titleHighlight,
    subtitle,
    steps[] {
      number,
      icon,
      title,
      description,
      descriptionHighlight,
      output
    },
    navigationButton {
      text,
      href
    }
  },
  capabilities {
    title,
    subheading,
    cards[] {
      icon,
      title,
      description,
      descriptionHighlight,
      metric
    }
  },
  servicesIntro {
    title,
    subheading,
    items[] {
      number,
      icon,
      title,
      description,
      descriptionHighlight,
      link
    },
    navigationButton {
      text,
      href
    }
  },
  techStack {
    title,
    subtitle,
    items[] {
      name,
      icon
    }
  }
}`;

export const servicesQuery = groq`*[_type == "services"][0]{
  hero {
    headline,
    headlineLine1,
    headlineLine2,
    description,
    descriptionHighlight,
    ctaText,
    ctaHref
  },
  stages {
    title,
    description,
    descriptionHighlight,
    services[] {
      name,
      description,
      descriptionHighlight,
      link
    },
    codeEdge,
    codeEdgeHighlight
  },
  impact {
    title,
    description,
    descriptionHighlight,
    industries[] {
      name,
      description,
      descriptionHighlight,
      icon,
      useCases,
      keyBenefit,
      keyBenefitHighlight
    },
    goal,
    goalHighlight
  },
  models {
    title,
    description,
    descriptionHighlight,
    models[] {
      name,
      subheadline,
      description,
      descriptionHighlight,
      bestFor,
      bestForHighlight,
      deliverables,
      idealFor
    }
  },
  cta {
    title,
    description,
    descriptionHighlight,
    ctaText,
    ctaHref
  }
}`;

export const serviceDetailsQuery = groq`*[_type == "serviceDetail"] | order(name asc){
  slug,
  name,
  shortDescription,
  icon,
  hero {
    title,
    subtitle,
    description,
    descriptionHighlight,
    keyBenefits
  },
  overview {
    title,
    description,
    descriptionHighlight,
    challenges,
    solutions
  },
  benefits {
    title,
    description,
    descriptionHighlight,
    features[] {
      title,
      description,
      icon
    }
  },
  process {
    title,
    description,
    descriptionHighlight,
    steps[] {
      step,
      title,
      description,
      deliverables
    }
  },
  outcomes {
    title,
    description,
    descriptionHighlight,
    metrics[] {
      label,
      value,
      description
    }
  },
  cta {
    title,
    description,
    descriptionHighlight,
    ctaText,
    ctaHref
  }
}`;

export const serviceDetailBySlugQuery = groq`*[_type == "serviceDetail" && slug == $slug][0]{
  slug,
  name,
  shortDescription,
  icon,
  hero {
    title,
    subtitle,
    description,
    descriptionHighlight,
    keyBenefits
  },
  overview {
    title,
    description,
    descriptionHighlight,
    challenges,
    solutions
  },
  benefits {
    title,
    description,
    descriptionHighlight,
    features[] {
      title,
      description,
      icon
    }
  },
  process {
    title,
    description,
    descriptionHighlight,
    steps[] {
      step,
      title,
      description,
      deliverables
    }
  },
  outcomes {
    title,
    description,
    descriptionHighlight,
    metrics[] {
      label,
      value,
      description
    }
  },
  cta {
    title,
    description,
    descriptionHighlight,
    ctaText,
    ctaHref
  }
}`;

export const aboutQuery = groq`*[_type == "about"] | order(_updatedAt desc)[0]{
  hero {
    headline,
    description,
    ctaText,
    ctaHref
  },
  mission {
    title,
    mission,
    missionHighlight,
    vision,
    visionHighlight
  },
  purpose {
    title,
    description,
    descriptionHighlight,
    nameOrigin {
      title,
      description,
      descriptionHighlight
    }
  },
  approach {
    title,
    description,
    descriptionHighlight,
    principles[] {
      letter,
      title,
      description,
      descriptionHighlight
    }
  },
  team {
    title,
    description,
    leadership[] {
      name,
      role,
      bio
    },
    advisors[] {
      name,
      role,
      bio
    }
  },
  partnership {
    title,
    description,
    descriptionHighlight
  },
  global {
    title,
    description,
    descriptionHighlight
  },
  cta {
    title,
    description,
    descriptionHighlight,
    ctaText,
    ctaHref
  }
}`;

export const siteConfigQuery = groq`*[_type == "siteConfig"][0]{
  name,
  tagline,
  description,
  url,
  email,
  privacyEmail,
  address {
    street,
    city,
    country,
    lat,
    lng
  },
  social {
    linkedin,
    twitter
  },
  stats {
    yearsExperience,
    technologiesMastered,
    industriesServed,
    foundingClients,
    responseTime
  }
}`;

export const footerQuery = groq`*[_type == "footer"][0]{
  sections[] {
    _key,
    title,
    icon,
    links[] {
      _key,
      label,
      href
    }
  }
}`;

export const navigationQuery = groq`*[_type == "navigation"][0]{
  items[] {
    _key,
    name,
    href,
    isModal,
    dropdown[] {
      _key,
      name,
      href,
      icon,
      description
    }
  }
}`;
