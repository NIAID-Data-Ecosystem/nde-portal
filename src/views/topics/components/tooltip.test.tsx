import React from 'react';
import { render, screen } from '@testing-library/react';
import { TooltipWrapper } from './tooltip';
import { ChakraProvider } from '@chakra-ui/react';

describe('TooltipWrapper', () => {
  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  it('renders children correctly', () => {
    renderWithChakra(
      <TooltipWrapper>
        <span>Test Child</span>
      </TooltipWrapper>,
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders the clickable search note when showsSearchHint is true', () => {
    renderWithChakra(
      <TooltipWrapper showsSearchHint>
        <span>Test Child</span>
      </TooltipWrapper>,
    );
    expect(
      screen.getByText(/Click to find search results related this type./i),
    ).toBeInTheDocument();
  });

  it('does not render the clickable search note when showsSearchHint is false', () => {
    renderWithChakra(
      <TooltipWrapper>
        <span>Test Child</span>
      </TooltipWrapper>,
    );
    expect(
      screen.queryByText(/Click to find search results related this type./i),
    ).not.toBeInTheDocument();
  });

  it('applies additional props to the Flex container', () => {
    renderWithChakra(
      <TooltipWrapper data-testid='tooltip-wrapper' maxWidth='300px'>
        <span>Test Child</span>
      </TooltipWrapper>,
    );
    const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
    expect(tooltipWrapper).toHaveStyle('max-width: 300px');
  });
});
