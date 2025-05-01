import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { IntroSection } from '../intro';

describe('IntroSection', () => {
  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <IntroSection {...props} />
      </ChakraProvider>,
    );
  };

  it('renders the title', () => {
    renderComponent({ title: 'Test Title' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Test Title',
    );
  });

  it('renders the subtitle when provided', () => {
    renderComponent({ subtitle: 'Test Subtitle' });

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    renderComponent({ description: 'Test Description' });

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  // it('shows skeleton loaders when isLoading is true', () => {
  //   renderComponent({ isLoading: true });
  //   expect(screen.getAllByRole('status')).toHaveLength(2); // Subtitle and Description skeletons
  // });

  it('does not render subtitle or description when not provided', () => {
    renderComponent();

    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });
});
