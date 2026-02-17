import { SearchState, VizConfig } from '../../types';
import { useDisclosure, Flex } from '@chakra-ui/react';
import { SelectedFilterTypeValue } from '../../../filters/types';
import { DEFAULT_MORE_PARAMS } from '../../helpers';
import { CardHeader } from './card-header';
import { ChartContent } from './chart-content';
import { DrillStackBreadcrumb } from './drill-stack-breadcrumb';
import { useVisualizationData } from '../../hooks/useVisualizationData';

type VisualizationCardProps = {
  config: VizConfig;
  searchState: SearchState;
  isActive: boolean;
  removeActiveVizId: (vizId: string) => void;
  onFilterUpdate?: (values: SelectedFilterTypeValue[], facet: string) => void;
  selectedFilters: SelectedFilterTypeValue[];
};

export const VisualizationCard = (props: VisualizationCardProps) => {
  const {
    config,
    searchState,
    isActive,
    onFilterUpdate,
    removeActiveVizId,
    selectedFilters,
  } = props;

  // Sets display to modal/expand view.
  const {
    isOpen: isModalView,
    onOpen: openModalView,
    onClose: closeModalView,
  } = useDisclosure();

  // Use custom hook for data management
  const {
    aggData,
    chartType,
    chartAdapter,
    bucketedData,
    drillStack,
    hasEmptyData,
    handleBack,
    handleSliceClick,
    isSliceSelected,
    setPreferredChartType,
  } = useVisualizationData({
    config,
    searchState,
    isActive,
    selectedFilters,
    onFilterUpdate,
  });

  if (!isActive) {
    return <></>;
  }

  const ChartComponent = chartAdapter.Component;

  return (
    <Flex
      direction='column'
      p={4}
      borderColor='gray.100'
      borderWidth='1px'
      borderRadius='md'
    >
      <CardHeader
        label={config.label}
        hasEmptyData={hasEmptyData}
        isActive={isActive}
        onExpand={openModalView}
        onRemove={() => removeActiveVizId(config.id)}
      />

      <ChartContent
        label={config.label}
        bucketedData={bucketedData || []}
        ChartComponent={ChartComponent}
        chartType={chartType}
        chartOptions={config.chart.availableOptions}
        onChartTypeChange={setPreferredChartType}
        onSliceClick={handleSliceClick}
        isSliceSelected={isSliceSelected}
        isActive={isActive}
        isEmpty={hasEmptyData}
        isError={aggData.isError}
        onRetry={() => aggData.refetch()}
        isPlaceholderData={aggData.isPlaceholderData}
        isModalOpen={isModalView}
        onModalClose={closeModalView}
      >
        {drillStack.length > 0 && (
          <DrillStackBreadcrumb
            label={config.label}
            moreLabel={DEFAULT_MORE_PARAMS.moreLabel}
            onBack={handleBack}
          />
        )}
      </ChartContent>
    </Flex>
  );
};
