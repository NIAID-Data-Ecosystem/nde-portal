import React from 'react';
import { Link } from 'src/components/link';

import { CardData } from './types';

export const CARDS_DATA: CardData[] = [
  {
    image: '/assets/homepage/influenza-a-virus-h1n1.png',
    imageAlt:
      'Microscopic view of the influenza A virus, a key focus in infectious disease research and vaccine development.',
    heading: 'Diseases and Conditions',
    headingHref: '/diseases',
    paragraphs: [
      {
        id: 'diseases-paragraph',
        content: (
          <>
            Explore datasets and computational tools for diseases such as{' '}
            <Link href='/diseases/asthma'>asthma</Link>,{' '}
            <Link href='/diseases/HIV-AIDS'>HIV/AIDS</Link>,{' '}
            <Link href='/diseases/influenza'>influenza</Link>,{' '}
            <Link href='/diseases/malaria'>malaria</Link>,{' '}
            <Link href='/diseases/tuberculosis'>tuberculosis</Link>, and{' '}
            <Link href='/diseases'>more</Link>.
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
            <Link href='/program-collections'>NIAID-funded programs</Link> that
            are driving innovation.
          </>
        ),
      },
    ],
    objectPosition: 'center',
  },
];
