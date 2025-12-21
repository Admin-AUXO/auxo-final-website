export interface FooterLink {
  _key: string;
  label: string;
  href: string;
}

export interface FooterSection {
  _key: string;
  title: string;
  icon: string;
  links: FooterLink[];
}

export interface FooterContent {
  sections: FooterSection[];
}
