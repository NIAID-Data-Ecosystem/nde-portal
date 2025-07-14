export interface FooterRoute {
  label: string;
  type?: 'email' | 'github';
  href: string;
  isExternal?: boolean;
  routes?: Array<FooterRoute>;
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
