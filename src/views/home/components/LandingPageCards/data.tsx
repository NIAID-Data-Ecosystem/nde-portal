import React from 'react';
import { CardData } from './types';
import { UnderlinedLink } from './UnderlinedLink';

export const CARDS_DATA: CardData[] = [
  {
    image: '/assets/homepage/influenza-a-virus-h1n1.png',
    imageAlt:
      'Microscopic view of the influenza A virus, a key focus in infectious disease research and vaccine development.',
    heading: 'Select Diseases and Conditions',
    headingHref: '/diseases',
    paragraphs: [
      {
        id: 'diseases-paragraph',
        content: (
          <>
            Explore datasets and computational tools for diseases such as{' '}
            <UnderlinedLink href='/diseases/asthma'>asthma</UnderlinedLink>,{' '}
            <UnderlinedLink href='/diseases/HIV-AIDS'>HIV/AIDS</UnderlinedLink>,{' '}
            <UnderlinedLink href='/diseases/influenza'>
              influenza
            </UnderlinedLink>
            , <UnderlinedLink href='/diseases/malaria'>malaria</UnderlinedLink>,{' '}
            <UnderlinedLink href='/diseases/tuberculosis'>
              tuberculosis
            </UnderlinedLink>
            , and <UnderlinedLink href='/diseases'>more</UnderlinedLink>.
          </>
        ),
      },
    ],
    objectPosition: 'center',
  },
  {
    image: '/assets/homepage/student-scrubs-green.png',
    imageAlt:
      'Group of biomedical researchers collaborating in a laboratory setting.',
    heading: 'NIAID-Funded Programs',
    headingHref: '/program-collections',
    paragraphs: [
      {
        id: 'programs-paragraph',
        content: (
          <>
            Find high-impact datasets and other resources from{' '}
            <UnderlinedLink href='/program-collections'>
              NIAID-funded programs
            </UnderlinedLink>{' '}
            that are driving innovation.
          </>
        ),
      },
    ],
    objectPosition: 'center',
  },
];
