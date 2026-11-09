import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { DescriptionSection } from '.';

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('DescriptionSection', () => {
  it('renders nothing when both description and abstract are missing', () => {
    const { container } = renderWithChakra(
      <DescriptionSection isLoading={false} />,
    );

    expect(container.querySelector('.chakra-skeleton')).not.toBeInTheDocument();
  });

  it.each([null, undefined, ''])(
    'renders nothing when description and abstract are %p',
    value => {
      const { container } = renderWithChakra(
        <DescriptionSection
          description={value}
          abstract={value}
          isLoading={false}
        />,
      );

      expect(
        container.querySelector('.chakra-skeleton'),
      ).not.toBeInTheDocument();
    },
  );

  it('renders the description text', () => {
    renderWithChakra(
      <DescriptionSection
        description='A description of the resource.'
        isLoading={false}
      />,
    );

    expect(
      screen.getByText('A description of the resource.'),
    ).toBeInTheDocument();
  });

  it('renders the abstract prefixed with a bolded "Abstract:" label', () => {
    renderWithChakra(
      <DescriptionSection abstract='An abstract summary.' isLoading={false} />,
    );

    expect(screen.getByText('Abstract:')).toBeInTheDocument();
    expect(screen.getByText(/An abstract summary\./)).toBeInTheDocument();
  });

  it('renders a divider between the abstract and the description', () => {
    renderWithChakra(
      <DescriptionSection
        abstract='An abstract summary.'
        description='A description of the resource.'
        isLoading={false}
      />,
    );

    expect(screen.getByText('Abstract:')).toBeInTheDocument();
    expect(
      screen.getByText('A description of the resource.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('does not render a divider when there is no abstract', () => {
    renderWithChakra(
      <DescriptionSection
        description='A description of the resource.'
        isLoading={false}
      />,
    );

    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('wraps the content in a skeleton while loading', () => {
    const { container } = renderWithChakra(
      <DescriptionSection
        description='A description of the resource.'
        isLoading={true}
      />,
    );

    expect(container.querySelector('.chakra-skeleton')).toBeInTheDocument();
    expect(
      screen.getByText('A description of the resource.'),
    ).toBeInTheDocument();
  });
});
