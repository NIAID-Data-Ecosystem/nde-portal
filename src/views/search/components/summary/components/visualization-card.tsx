import { ChartDatum, ChartType, SearchState, VizConfig } from '../types';
import { useAggregationQuery } from '../hooks/useAggregationQuery';
import {
  bucketSmallValues,
  chartRegistry,
  DEFAULT_MORE_PARAMS,
  isMoreSlice,
  normalizeAggregateData,
} from '../helpers';
import { usePreferredChartType } from '../hooks/usePreferredChartType';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartTypePicker } from './chart-picker';
import {
  Box,
  Button,
  Flex,
  Heading,
  HeadingProps,
  HStack,
  Icon,
  IconButton,
  IconButtonProps,
  IconProps,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FaArrowLeft, FaExpand, FaXmark } from 'react-icons/fa6';
import { ModalViewer } from './modal-viewer';
import Tooltip from 'src/components/tooltip';

type VisualizationCardProps = {
  config: VizConfig;

  searchState: SearchState;

  isActive: boolean;

  removeActiveVizId: (vizId: string) => void;

  onFilterUpdate?: (values: string[], facet: string) => void;
};

export const VisualizationCardHeader = ({
  label,
}: HeadingProps & { label: string }) => {
  return (
    <Heading as='h2' fontSize='xs' noOfLines={1}>
      {label}
    </Heading>
  );
};

export const VisualizationCardIconButton = ({
  icon,
  ariaLabel,
  tooltipContent,
  onClick,
}: Omit<IconButtonProps, 'aria-label' | 'as' | 'icon'> & {
  ariaLabel: string;
  tooltipContent: string;
  icon: IconButtonProps['as'];
}) => {
  return (
    <Tooltip label={tooltipContent} hasArrow>
      <Box>
        <IconButton
          as={icon}
          aria-label={ariaLabel}
          onClick={onClick}
          variant='ghost'
          cursor='pointer'
          colorScheme='gray'
          boxSize={5}
          p={0.5}
        />
      </Box>
    </Tooltip>
  );
};

export const VisualizationCard = (props: VisualizationCardProps) => {
  // Sets display to modal/expand view.
  const {
    isOpen: isModalView,
    onOpen: openModalView,
    onClose: closeModalView,
  } = useDisclosure();

  const { config, searchState, isActive, onFilterUpdate, removeActiveVizId } =
    props;

  // Drill stack to manage "More" drill-downs.
  const [drillStack, setDrillStack] = useState<ChartDatum[][]>([]);

  // Use preferred chart type hook to manage user preference.
  const [preferredChartType, setPreferredChartType] = usePreferredChartType(
    config.id,
    config.chart.defaultOption,
  );

  // Clamp preference to what's allowed (in case options changed)
  const chartType = useMemo<ChartType>(() => {
    return config.chart.availableOptions.includes(preferredChartType)
      ? preferredChartType
      : config.chart.defaultOption;
  }, [
    preferredChartType,
    config.chart.availableOptions,
    config.chart.defaultOption,
  ]);

  // Fetch aggregation data based on the config and search state.
  const aggData = useAggregationQuery({
    property: config.property,
    searchState,
    enabled: isActive,
  });

  // Normalize the aggregated data.
  const facetData =
    aggData.data && normalizeAggregateData(aggData.data, config.property);

  // Format chart data.
  const chartAdapter = chartRegistry[chartType];
  const chartData = useMemo(() => {
    return (
      facetData &&
      chartAdapter.mapFacetsToChartData(facetData, {
        formatLabel:
          config.formatting?.label ??
          ((term, count) => `${term} (${count.toLocaleString()})`),
      })
    );
  }, [facetData, chartType, config.formatting]);

  // Current level data based on drill stack.
  const currentLevelData = useMemo(() => {
    return drillStack.length ? drillStack[drillStack.length - 1] : chartData;
  }, [chartData, drillStack]);

  // Bucket small values into "More"
  const { bucketedData, tail } = useMemo(() => {
    const { data, tail } = bucketSmallValues(currentLevelData || [], {
      ...config.chart?.[chartType],
      moreLabel: DEFAULT_MORE_PARAMS.moreLabel,
    });

    return { bucketedData: data, tail };
  }, [currentLevelData, config]);

  // If the query/config changes, reset drill mode
  useEffect(() => {
    setDrillStack([]);
  }, [config.id, config.property, chartType, facetData?.length, config.chart]);

  useEffect(() => {
    // If preferred chart type is no longer valid, reset to default.
    if (!config.chart.availableOptions.includes(preferredChartType)) {
      setPreferredChartType(config.chart.defaultOption);
    }
  }, [config.chart.availableOptions.join('|')]);

  // Handler for back navigation in drill stack.
  const handleBack = useCallback(() => {
    setDrillStack(stack => stack.slice(0, -1));
  }, []);

  // Handler for slice clicks in the chart.
  const handleSliceClick = useCallback(
    (id: string) => {
      if (isMoreSlice(id)) {
        if (tail.length > 0) {
          setDrillStack(stack => [...stack, tail]);
        }
        return;
      }
      onFilterUpdate?.([id], config.property);
    },
    [tail, onFilterUpdate, config.property],
  );

  if (!isActive) {
    return <></>;
  }

  // [TO DO]: Add loading, error, and empty states.
  // if (aggData.isError) {
  //   // refetch option + error handling can be added here
  //   return <>Error State</>;
  // }
  // if (aggData.isLoading || !facetData) {
  //   return <>Loading State</>;
  // }

  // No data available for the given aggregation. Empty state
  const hasEmptyData = facetData?.length === 0;
  const ChartComponent = chartAdapter.Component;

  return (
    <Flex
      direction='column'
      p={4}
      borderColor='gray.100'
      borderWidth='1px'
      borderRadius='md'
    >
      <Flex mb={4} justify='space-between' align='center'>
        <VisualizationCardHeader label={config.label} />

        {!hasEmptyData && (
          <HStack gap={2}>
            <ChartTypePicker
              value={chartType}
              options={config.chart.availableOptions}
              onChange={setPreferredChartType}
              isDisabled={!isActive}
            />
            <VisualizationCardIconButton
              ariaLabel='Expand chart to modal view'
              tooltipContent='Expand chart to modal view.'
              icon={FaExpand}
              onClick={openModalView}
              isDisabled={!isActive}
            />
            <VisualizationCardIconButton
              ariaLabel='Remove chart from display.'
              tooltipContent='Remove chart from display.'
              icon={FaXmark}
              onClick={() => removeActiveVizId(config.id)}
              isDisabled={!isActive}
            />
          </HStack>
        )}
      </Flex>
      <ModalViewer
        label={config.label}
        isOpen={isModalView}
        onClose={closeModalView}
      >
        {drillStack.length > 0 && (
          <Flex alignItems='center' fontSize='xs'>
            <Button
              size='xs'
              variant='ghost'
              onClick={handleBack}
              color='link.color'
              textDecoration='underline'
              mr={2}
            >
              <Icon as={FaArrowLeft} boxSize={3} mr={1} />
              Back
            </Button>
            <Text noOfLines={1}>
              {config.label} / {DEFAULT_MORE_PARAMS.moreLabel}...
            </Text>
          </Flex>
        )}
        <Flex
          h={
            isModalView
              ? 'clamp(180px, 50vh, 450px)'
              : 'clamp(180px, 30vh, 250px)'
          }
        >
          {hasEmptyData ? (
            <Text
              color='page.placeholder'
              fontStyle='italic'
              textAlign='center'
              w='100%'
            >
              No data available for the selected aggregation.
            </Text>
          ) : (
            <ChartComponent
              data={bucketedData || []}
              onSliceClick={handleSliceClick}
              isExpanded={isModalView}
            />
          )}
        </Flex>
      </ModalViewer>
    </Flex>
  );
};
