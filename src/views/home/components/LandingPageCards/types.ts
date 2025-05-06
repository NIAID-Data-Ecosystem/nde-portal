import { ReactNode } from 'react';

export type CardData = {
  image: string;
  imageAlt: string;
  heading: string;
  headingHref: string;
  paragraphs: Array<{
    id: string;
    content: ReactNode;
  }>;
  objectPosition: string;
};
