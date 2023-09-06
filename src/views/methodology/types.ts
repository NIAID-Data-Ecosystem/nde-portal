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

interface OverviewProps {
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

interface Card {
  id: number;
  icon: ImageProps;
  additionalInfo?: string;
  isRequired?: boolean;
  content: string;
  tabItems: TabItem[];
}

interface TabItem {
  id: number;
  tabname: string;
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
