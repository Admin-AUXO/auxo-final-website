export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  privacyEmail: string;
  address: {
    street: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  social: {
    linkedin: string;
    twitter: string;
  };
  stats: {
    yearsExperience: string;
    technologiesMastered: string;
    industriesServed: string;
    foundingClients: string;
    responseTime: string;
  };
}
