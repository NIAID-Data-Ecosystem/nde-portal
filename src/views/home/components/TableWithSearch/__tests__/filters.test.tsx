import userEvent from '@testing-library/user-event';
import { act, render, screen } from 'src/__tests__/utils/render';
import { CheckboxMenu } from 'src/components/checkbox-list';

import { Filters } from '../filters/';

// Menu content only mounts once opened. zag drops a click dispatched before its
// machine has started, hence the tick before opening.
const openMenu = async (name: RegExp) => {
  await act(async () => {});
  await userEvent.click(screen.getByRole('button', { name }));
};

describe('Landing Table Filters Component', () => {
  const mockData = [
    {
      _id: 'source_01',
      name: 'Source 1',
      abstract: 'Lorem ipsum dolor sit amet',
      domain: 'iid',
      conditionsOfAccess: 'Open',
      type: ['Resource Catalog'],
    },
    {
      _id: 'source_02',
      name: 'Source 2',
      abstract: 'Orci varius natoque penatibus et magnis dis parturient montes',
      domain: 'generalist',
      conditionsOfAccess: 'Open',
      type: ['Dataset Repository'],
    },
    {
      _id: 'source_03',
      name: 'Source 3',
      abstract: 'Lorem ipsum dolor sit amet',
      domain: 'iid',
      conditionsOfAccess: 'Restricted',
      type: ['Resource Catalog'],
    },
  ] as any[];

  const mockFilters = [
    { name: 'Open Access', value: 'Open', property: 'conditionsOfAccess' },
  ];
  const mockUpdateFilter = jest.fn();

  it('renders without crashing', () => {
    render(
      <Filters
        data={mockData}
        filters={mockFilters}
        setFilters={mockUpdateFilter}
      />,
    );

    expect(screen.getByRole('button', { name: /type/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Research domain/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /access/i })).toBeInTheDocument();
  });

  it('passes correct props to CheckboxMenu components', async () => {
    render(
      <Filters
        data={mockData}
        filters={mockFilters}
        setFilters={mockUpdateFilter}
      />,
    );
    await openMenu(/type/i);

    // Use findByText to wait asynchronously for the labels to appear
    const resourceCatalogLabel = await screen.findByText('Resource Catalog');
    const repositoryLabel = await screen.findByText('Dataset Repository');

    expect(resourceCatalogLabel).toBeInTheDocument();
    expect(repositoryLabel).toBeInTheDocument();
  });
});

describe('Landing Table CheckboxMenu Component', () => {
  const mockOptions = [
    { name: 'Resource Catalog', value: 'ResourceCatalog', count: 10 },
    { name: 'Dataset Repository', value: 'Repository', count: 5 },
    {
      name: 'Computational Tools Repository',
      value: 'ComputationalTools',
      count: 5,
    },
  ];
  const mockSelectedOptions = [
    { name: 'Dataset Repository', value: 'Repository' },
  ];
  const mockHandleChange = jest.fn();

  it('renders options correctly', async () => {
    render(
      <CheckboxMenu
        id='type'
        label='Type'
        options={mockOptions}
        handleChange={mockHandleChange}
        selectedOptions={mockSelectedOptions}
      />,
    );

    await openMenu(/type/i);

    expect(await screen.findByText('Resource Catalog')).toBeInTheDocument();
    expect(screen.getByText('Dataset Repository')).toBeInTheDocument();
  });

  it('calls handleChange on option click', async () => {
    render(
      <CheckboxMenu
        id='type'
        label='Type'
        options={mockOptions}
        handleChange={mockHandleChange}
        selectedOptions={mockSelectedOptions}
      />,
    );

    await openMenu(/type/i);
    await userEvent.click(await screen.findByText('Resource Catalog'));

    const newSelectedOptions = [
      ...mockSelectedOptions,
      ...mockOptions.filter(item => item.value === 'ResourceCatalog'),
    ];
    expect(mockHandleChange).toHaveBeenCalledWith(newSelectedOptions);
  });
});
