import { Tabs } from '@chakra-ui/react';
import React from 'react';
import { act, render, screen } from 'src/__tests__/utils/render';

import { SearchTabs } from '../tabs';

type TabsWithCounts = React.ComponentProps<typeof SearchTabs>['tabs'];

const TABS: TabsWithCounts = [
  {
    id: 'd' as const,
    types: [
      { label: 'Datasets', type: 'Dataset' as const, count: 5 },
      {
        label: 'Resource Catalogs',
        type: 'ResourceCatalog' as const,
        count: 2,
      },
      { label: 'Disease Overviews', type: 'Disease' as const, count: 1 },
    ],
  },
  {
    id: 'ct' as const,
    types: [{ label: 'Tools', type: 'ComputationalTool' as const, count: 7 }],
  },
];

const setup = async (programInfoCount: number | undefined, tabs = TABS) => {
  const view = render(
    <SearchTabs
      tabs={tabs}
      defaultValue='d'
      programInfoCount={programInfoCount}
      renderTabPanels={() =>
        TABS.map(tab => (
          <Tabs.Content key={tab.id} value={tab.id}>
            {tab.id} panel
          </Tabs.Content>
        ))
      }
    />,
  );
  await act(async () => {});
  return view;
};

describe('SearchTabs', () => {
  it('counts Program Info cards with the Other Resources', async () => {
    const { container } = await setup(4);

    // Resource Catalogs (2) + Disease Overviews (1) + Program Info (4).
    expect(screen.getByRole('tab', { name: /Datasets/ })).toHaveTextContent(
      /^Datasets5and Other Resources7$/,
    );
    expect(screen.getByRole('tab', { name: /Tools/ })).toHaveTextContent(
      /^Tools7$/,
    );
    // Consumed, not spread onto the DOM.
    expect(container.querySelector('[programinfocount]')).toBeNull();
  });

  it('shows a placeholder, not zero, for a count still loading', async () => {
    // Program Info and the Tools count haven't loaded yet.
    await setup(undefined, [
      TABS[0],
      { ...TABS[1], types: [{ ...TABS[1].types[0], count: undefined }] },
    ]);

    // Other Resources needs every part, so it waits for Program Info too.
    const datasets = screen.getByRole('tab', { name: /Datasets/ });
    expect(datasets).toHaveTextContent(/^Datasets5and Other Resources$/);
    const tools = screen.getByRole('tab', { name: /Tools/ });
    expect(tools).toHaveTextContent(/^Tools$/);
    expect(
      tools.querySelector('[data-scope="skeleton"], .chakra-skeleton'),
    ).not.toBeNull();
  });
});
