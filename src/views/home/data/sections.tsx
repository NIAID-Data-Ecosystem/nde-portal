import React from 'react';
import { Link } from 'src/components/link';

import type { LandingPageCards } from '../components/cards/types';

export const LANDING_PAGE_SECTIONS: LandingPageCards = {
  hero: {
    heading: 'Discovery Portal',
    subheading:
      'Accelerate your research. Find datasets on Infectious and Immune-mediated Diseases (IID) across many repositories.',
  },
  'getting-started': {
    data: [
      {
        image: {
          src: '/assets/homepage/getting-started.png',
          alt: 'The image shows a healthcare professional, likely a doctor, wearing a white coat and stethoscope, interacting with a digital interface. The interface displays various health-related icons, such as a heart, a DNA helix, a medical cross, a microscope, a pill, an apple, and a syringe, representing different aspects of healthcare and medical research. The doctor is pointing at the heart icon, indicating a focus on heart health or medical diagnostics.',
          maxWidth: { base: '100%', md: '40%', lg: '60%' },
          maxHeight: { base: '250px', md: 'none', lg: '250px' },
        },
        heading: 'Getting Started',
        descriptions: [
          {
            id: 'getting-started-paragraph',
            content: (
              <>
                If you are new to the NIAID Data Ecosystem Discovery Portal you
                can find tips for searching infectious and immune disease
                datasets, learn about the different repositories, discover how
                best to filter results, and more...
              </>
            ),
          },
        ],
        footer: {
          cta: [
            {
              children: 'Read more about getting started',
              href: '/knowledge-center/getting-started-with-niaid-data-ecosystem-discovery-portal',
            },
          ],
        },
      },
    ],
  },
  topics: {
    heading: 'Find Resources by Topic',
    data: [
      {
        image: {
          src: '/assets/homepage/influenza-a-virus-h1n1.png',
          alt: 'Microscopic view of the influenza A virus, a key focus in infectious disease research and vaccine development.',
        },
        heading: 'Diseases and Conditions',
        headingHref: '/diseases',
        descriptions: [
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
      },
      {
        image: {
          src: '/assets/homepage/student-scrubs-green.png',
          alt: 'Group of biomedical researchers collaborating in a laboratory setting.',
          objectPosition: 'center',
        },
        heading: 'NIAID-Funded Programs',
        headingHref: '/program-collections',
        descriptions: [
          {
            id: 'programs-paragraph',
            content: (
              <>
                Find high-impact datasets and other resources from{' '}
                <Link href='/program-collections'>NIAID-funded programs</Link>{' '}
                that are driving innovation.
              </>
            ),
          },
        ],
      },
    ],
  },
};
