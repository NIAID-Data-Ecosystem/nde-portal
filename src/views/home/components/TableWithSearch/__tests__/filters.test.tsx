import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filters } from '../filters/';
import { CheckboxList } from 'src/components/checkbox-list';

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

    expect(screen.findByRole('button', { name: /type/i })).toBeInTheDocument;
    expect(screen.findByRole('button', { name: /Research domain/i }))
      .toBeInTheDocument;
    expect(screen.findByRole('button', { name: /access/i })).toBeInTheDocument;
  });

  it('passes correct props to CheckboxList components', async () => {
    render(
      <Filters
        data={mockData}
        filters={mockFilters}
        setFilters={mockUpdateFilter}
      />,
    );
    // Find the button and simulate a click
    const typeButton = screen.getByRole('button', { name: /type/i });
    userEvent.click(typeButton);

    // Use findByText to wait asynchronously for the labels to appear
    const resourceCatalogLabel = await screen.findByText('Resource Catalog');
    const repositoryLabel = await screen.findByText('Dataset Repository');

    expect(resourceCatalogLabel).toBeInTheDocument();
    expect(repositoryLabel).toBeInTheDocument();
  });
});

describe('Landing Table CheckboxList Component', () => {
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

  it('renders options correctly', () => {
    render(
      <CheckboxList
        label='Type'
        options={mockOptions}
        handleChange={mockHandleChange}
        selectedOptions={mockSelectedOptions}
      />,
    );

    expect(screen.getByText('Resource Catalog')).toBeInTheDocument();
    expect(screen.getByText('Dataset Repository')).toBeInTheDocument();
  });

  it('calls handleChange on option click', () => {
    render(
      <CheckboxList
        label='Type'
        options={mockOptions}
        handleChange={mockHandleChange}
        selectedOptions={mockSelectedOptions}
      />,
    );

    fireEvent.click(screen.getByText('Resource Catalog'));

    const newSelectedOptions = [
      ...mockSelectedOptions,
      ...mockOptions.filter(item => item.value === 'ResourceCatalog'),
    ];
    expect(mockHandleChange).toHaveBeenCalledWith(newSelectedOptions);
  });
});
