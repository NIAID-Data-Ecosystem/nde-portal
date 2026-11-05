import React from 'react';
import { Link } from 'src/components/link';
import { ImageCardProps } from 'src/views/home/components/ImageCard';

/** Cards for the home page's "Find Resources By Topic" section. */
export const TOPIC_CARDS: Pick<
  ImageCardProps,
  'title' | 'titleHref' | 'description' | 'imageProps'
>[] = [
  {
    title: 'Diseases and Conditions',
    titleHref: '/diseases',
    description: (
      <>
        Explore datasets and computational tools for diseases and conditions
        such as <Link href='/diseases/asthma'>asthma</Link>,{' '}
        <Link href='/diseases/HIV-AIDS'>HIV/AIDS</Link>,{' '}
        <Link href='/diseases/influenza'>influenza</Link>,{' '}
        <Link href='/diseases/malaria'>malaria</Link>,{' '}
        <Link href='/diseases/tuberculosis'>tuberculosis</Link>, and{' '}
        <Link href='/diseases'>more</Link>.
      </>
    ),
    imageProps: {
      src: '/assets/homepage/influenza-a-virus-h1n1.png',
      alt: 'Microscopic view of the influenza A virus, a key focus in infectious disease research and vaccine development.',
    },
  },
  {
    title: 'NIAID-Funded Programs',
    titleHref: '/program-collections',
    description: (
      <>
        Find high-impact datasets and other resources from{' '}
        <Link href='/program-collections'>NIAID-funded programs</Link> that are
        driving innovation.
      </>
    ),
    imageProps: {
      src: '/assets/homepage/student-scrubs-green.png',
      alt: 'Group of biomedical researchers collaborating in a laboratory setting.',
    },
  },
];
