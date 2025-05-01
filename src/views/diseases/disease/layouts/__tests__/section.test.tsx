import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { SectionTitle, SectionWrapper } from '../section';

describe('SectionTitle', () => {
  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <SectionTitle {...props} />
      </ChakraProvider>,
    );
  };

  it('renders the component', () => {
    renderComponent({ as: 'h1', children: 'Test Title' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Test Title',
    );
  });

  it('renders nothing when children and isLoading are not provided', () => {
    renderComponent({});
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the correct heading level based on the "as" prop', () => {
    renderComponent({ as: 'h3', children: 'Test H3' });
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Test H3',
    );
  });

  it('renders the correct heading level based on the "as" prop', () => {
    renderComponent({ as: 'h4', children: 'Test H4' });
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent(
      'Test H4',
    );
  });
});

describe('SectionWrapper', () => {
  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <SectionWrapper id='id' title='title' {...props} />
      </ChakraProvider>,
    );
  };

  it('renders the section with the correct title', () => {
    renderComponent({ id: 'test-section', title: 'Section Title' });
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Section Title',
    );
  });

  it('renders children inside the section', () => {
    renderComponent({
      id: 'test-section',
      title: 'Section Title',
      children: <div>Child Content</div>,
    });
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('applies the correct heading level for the title', () => {
    renderComponent({ id: 'test-section', title: 'Custom Title', as: 'h3' });
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Custom Title',
    );
  });
});
