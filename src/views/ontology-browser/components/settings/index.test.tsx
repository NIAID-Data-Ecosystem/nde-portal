import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { OntologyBrowserSettings } from './';
import { OntologyViewSettings } from './components/ontology-view-settings';
import { ChakraProvider } from '@chakra-ui/react';
import { useLocalStorage } from 'usehooks-ts';
import { transformSettingsToLocalStorageConfig } from './helpers';

jest.mock('usehooks-ts', () => ({
  useLocalStorage: jest.fn(),
}));

describe('OntologyBrowserSettings', () => {
  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <OntologyBrowserSettings label='Settings' buttonProps={{}} {...props} />
      </ChakraProvider>,
    );
  };

  beforeEach(() => {
    (useLocalStorage as jest.Mock).mockReturnValue([
      {
        ['isCondensed']: {
          label: 'Enable condensed view?',
          value: true,
        },
        ['hideEmptyCounts']: {
          label: 'Hide terms with 0 datasets?',
          value: false,
        },
      }, // default value
      jest.fn(), // mock setter function
    ]);
  });

  test('renders the trigger button with the correct label', () => {
    renderComponent();
    expect(
      screen.getByRole('button', { name: /settings/i }),
    ).toBeInTheDocument();
  });

  test('renders the description when provided', () => {
    const description = 'This is a description';
    renderComponent({ description });
    act(() => {
      screen.getByRole('button', { name: /settings/i }).click();
    });
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  test('does not render the description when not provided', () => {
    renderComponent();
    act(() => {
      screen.getByRole('button', { name: /settings/i }).click();
    });
    expect(
      screen.queryByText(/this is a description/i),
    ).not.toBeInTheDocument();
  });

  test('does render the header and description when provided and popover opened', () => {
    render(
      <ChakraProvider>
        <OntologyBrowserSettings
          label='Settings'
          description='This is a description'
          buttonProps={{}}
          settings={{
            ['isCondensed']: {
              label: 'Enable condensed view?',
              value: true,
            },
            ['hideEmptyCounts']: {
              label: 'Hide terms with 0 datasets?',
              value: true,
            },
          }}
        />
      </ChakraProvider>,
    );
    act(() => {
      screen.getByRole('button', { name: /settings/i }).click();
    });
    expect(screen.queryByText(/this is a description/i)).toBeInTheDocument();

    // The popover and on the trigger button should both contain the label
    const settingsElements = screen.getAllByText(/settings/i);
    expect(settingsElements).toHaveLength(2);
  });
});

describe('OntologyViewSettings', () => {
  const mockSetViewConfig = jest.fn();

  const settings = {
    ['isCondensed']: {
      label: 'a checked switch?',
      value: true,
    },
    ['hideEmptyCounts']: {
      label: 'an unchecked switch?',
      value: false,
    },
  };

  beforeEach(() => {
    (useLocalStorage as jest.Mock).mockReturnValue([
      transformSettingsToLocalStorageConfig(settings),
      mockSetViewConfig,
    ]);
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <OntologyViewSettings settings={settings} {...props} />
      </ChakraProvider>,
    );
  };

  test('renders the checked switch with the correct label', () => {
    renderComponent();
    expect(screen.getByLabelText(/a checked switch/i)).toBeInTheDocument();
  });

  test('renders the unchecked switch with the correct label', () => {
    renderComponent();
    expect(screen.getByLabelText(/an unchecked switch/i)).toBeInTheDocument();
  });

  test('toggles the a checked switch to false', () => {
    renderComponent();
    const switchElement = screen.getByLabelText(/a checked switch/i);
    expect(switchElement).toBeChecked();

    act(() => {
      fireEvent.click(switchElement);
    });

    expect(mockSetViewConfig).toHaveBeenCalledWith(
      expect.objectContaining({ isCondensed: false }),
    );
    expect(mockSetViewConfig).toHaveBeenCalledTimes(1);
  });

  test('toggles the an unchecked switch to true', () => {
    renderComponent();
    const switchElement = screen.getByLabelText(/an unchecked switch/i);
    expect(switchElement).not.toBeChecked();

    act(() => {
      fireEvent.click(switchElement);
    });

    expect(mockSetViewConfig).toHaveBeenCalledWith(
      expect.objectContaining({ hideEmptyCounts: true }),
    );
    expect(mockSetViewConfig).toHaveBeenCalledTimes(1);
  });
});
