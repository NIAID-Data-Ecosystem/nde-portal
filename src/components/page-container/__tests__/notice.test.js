import { fireEvent, render, screen } from '@testing-library/react';
import Notice from '../components/notice';
import { StyledSection, StyledText } from '../components/header/styles.tsx';

describe('Notice', () => {
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it('sets warningOpen in localStorage to false when "Got it" button is clicked', () => {
    const { getByText } = render(<Notice />);

    expect(window.localStorage.getItem('warningOpen')).toBe(null);
    expect(getByText('Read Less')).toBeInTheDocument();

    // Fire the "Got it" button.
    const gotItButton = getByText('Got it');
    fireEvent.click(gotItButton);

    // Then, check that warningOpen is false in localStorage
    expect(window.localStorage.getItem('warningOpen')).toBe('false');
    expect(getByText('Read More')).toBeInTheDocument();
  });
});

describe('PageContainer Header', () => {
  test('Styled Section renders children and propagates props', () => {
    render(
      <StyledSection data-testid='styled-section'>
        <div>Test Child</div>
      </StyledSection>,
    );

    const sectionElement = screen.getByTestId('styled-section');
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveTextContent('Test Child');
  });

  test('StyledText renders children and propagates props', () => {
    render(<StyledText data-testid='styled-text'>Test Text</StyledText>);

    const textElement = screen.getByTestId('styled-text');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveTextContent('Test Text');
  });
});
