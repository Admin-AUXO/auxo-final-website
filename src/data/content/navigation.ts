export interface DropdownItem {
  _key?: string;
  name: string;
  href: string;
  icon: string;
  description?: string;
}

export interface NavItem {
  _key?: string;
  name: string;
  href: string;
  isModal?: boolean;
  dropdown?: DropdownItem[];
}

export interface NavigationContent {
  items: NavItem[];
}
