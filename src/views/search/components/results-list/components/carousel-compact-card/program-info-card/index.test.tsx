import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { ProgramInfoCard } from '.';

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

const makeData = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'a-program',
    term: 'A Program',
    count: 3,
    sourceOrganization: {
      name: 'A Program Name',
      abstract: 'About this program.',
    },
    ...overrides,
  } as any);

describe('ProgramInfoCard', () => {
  it('renders the Program Info banner label', () => {
    renderWithChakra(<ProgramInfoCard data={makeData()} />);

    expect(screen.getByText('Program Info')).toBeInTheDocument();
  });

  it('links the title to the anchored program collections entry', () => {
    renderWithChakra(<ProgramInfoCard data={makeData()} />);

    expect(
      screen.getByRole('link', { name: 'A Program Name' }),
    ).toHaveAttribute('href', '/program-collections#a-program');
  });

  it('falls back to the term when there is no sourceOrganization', () => {
    renderWithChakra(
      <ProgramInfoCard data={makeData({ sourceOrganization: null })} />,
    );

    expect(screen.getByRole('link', { name: 'A Program' })).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderWithChakra(<ProgramInfoCard data={makeData()} />);

    expect(screen.getByText('About this program.')).toBeInTheDocument();
  });
});
