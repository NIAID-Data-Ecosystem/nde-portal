import { Flex } from '@chakra-ui/react';
import { ChartDatum, ChartType } from '../../types';
import { ChartTypePicker } from './chart-picker';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { ModalViewer } from './modal-viewer';

export interface ChartComponentProps {
  data: ChartDatum[];
  onSliceClick: (id: string) => void;
  isExpanded: boolean;
  isSliceSelected: (id: string) => boolean;
}

interface ChartContentProps {
  label: string;
  bucketedData: ChartDatum[];
  ChartComponent: React.ComponentType<ChartComponentProps>;
  chartType: ChartType;
  chartOptions: ChartType[];
  children?: React.ReactNode;
  onChartTypeChange: (type: ChartType) => void;
  onRetry: () => void;
  onSliceClick: (id: string) => void;
  isSliceSelected: (id: string) => boolean;
  isActive: boolean;
  isEmpty: boolean;
  isError: boolean;
  isPlaceholderData: boolean;
  // Modal props
  isModalOpen: boolean;
  onModalClose: () => void;
}

export const ChartContent = ({
  label,
  bucketedData,
  ChartComponent,
  chartType,
  chartOptions,
  children,
  onChartTypeChange,
  onRetry,
  onSliceClick,
  isSliceSelected,
  isActive,
  isEmpty,
  isError,
  isPlaceholderData,
  isModalOpen,
  onModalClose,
}: ChartContentProps) => {
  const renderChartView = (isExpanded: boolean) => {
    const height = isExpanded
      ? 'clamp(180px, 50vh, 450px)'
      : 'clamp(180px, 30vh, 250px)';

    // No data is provided for the chart.
    if (isEmpty) {
      return <EmptyState height={height} />;
    }
    // An error occurred while fetching data for the chart.
    if (isError) {
      return <ErrorState onRetry={onRetry} />;
    }

    return (
      <Flex h={height} opacity={isPlaceholderData ? 0.7 : 1} direction='column'>
        <Flex
          alignItems='center'
          justifyContent='flex-end'
          flexWrap='wrap'
          flexShrink={0}
        >
          {children}
          <ChartTypePicker
            value={chartType}
            options={chartOptions}
            onChange={onChartTypeChange}
            isDisabled={!isActive}
          />
        </Flex>
        <Flex flex={1} minH={0}>
          <ChartComponent
            data={bucketedData}
            onSliceClick={onSliceClick}
            isExpanded={isExpanded}
            isSliceSelected={isSliceSelected}
          />
        </Flex>
      </Flex>
    );
  };

  // Render the chart view and the modal viewer for expanded view
  return (
    <>
      {renderChartView(false)}
      <ModalViewer label={label} isOpen={isModalOpen} onClose={onModalClose}>
        {renderChartView(true)}
      </ModalViewer>
    </>
  );
};
