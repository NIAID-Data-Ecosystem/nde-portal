interface ImageProps {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string;
      url: string;
    };
  };
}

export interface OverviewProps {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image?: ImageProps;
}

interface Tabs {
  id: number;
  title: string;
  description?: string;
  slug: string;
  panels?: Panel[];
}

interface Panel {
  id: number;
  title: string;
  cards?: Card[];
}

export interface Card {
  id: number;
  title: string;
  icon: ImageProps;
  additionalInfo?: string;
  isRequired?: boolean;
  content: string;
  tabItems: TabItem[];
}

interface TabItem {
  id: number;
  name: string;
  content: string;
  icon: ImageProps;
}

export interface ContentProps {
  id: number;
  attributes: {
    title: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    description: string;
    overview?: OverviewProps[];
    tabs?: Tabs;
  };
}
