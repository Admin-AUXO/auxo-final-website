export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  icon: string;
  links: FooterLink[];
}

export interface FooterContent {
  sections: FooterSection[];
}

export const footerContent: FooterContent = {
  "sections": [
    {
      "icon": "mdi:book-open",
      "links": [
        {
          "href": "/about",
          "label": "About Us"
        },
        {
          "href": "/services",
          "label": "Services"
        }
      ],
      "title": "Learn"
    },
    {
      "icon": "mdi:handshake",
      "links": [
        {
          "href": "/contact",
          "label": "Contact Us"
        }
      ],
      "title": "Engage"
    },
    {
      "icon": "mdi:shield-check",
      "links": [
        {
          "href": "/legal/privacy-policy",
          "label": "Privacy Policy"
        },
        {
          "href": "/legal/terms",
          "label": "Terms of Service"
        },
        {
          "href": "/legal/cookie-policy",
          "label": "Cookie Policy"
        }
      ],
      "title": "Legal"
    }
  ]
};
