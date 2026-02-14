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
