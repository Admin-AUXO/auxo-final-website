import { siteData } from "@/data/content/siteConfig-data";

export function createBreadcrumbSchema(path: string, name: string) {
  return {
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteData.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: `${siteData.url}${path}`,
      },
    ],
  };
}

export function createServiceSchema() {
  return {
    serviceType: "Decision Intelligence Partner",
    provider: {
      "@type": "Organization",
      name: siteData.name,
      url: siteData.url,
    },
    areaServed: [
      {
        "@type": "Country",
        name: "United Arab Emirates",
      },
      {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: siteData.address.coordinates.lat,
          longitude: siteData.address.coordinates.lng,
        },
        geoRadius: {
          "@type": "Distance",
          name: "Global",
        },
      },
    ],
    description: siteData.description,
    offers: {
      "@type": "Offer",
      description: "Enterprise-grade decision intelligence partnership",
    },
  };
}
