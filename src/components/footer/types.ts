export interface FooterRoute {
  label: string;
  href: string;
  type?: 'email' | 'github';
  isExternal?: boolean;
}

export interface FooterSection {
  label: string;
  routes: FooterRoute[];
}

export interface FooterContact {
  label: string;
  routes: FooterRoute[];
}

export interface FooterLastUpdate {
  label: string;
  href: string;
}

export interface Footer {
  contact: FooterContact;
  sections: FooterSection[];
  lastUpdate: FooterLastUpdate[];
}
