import { Heading, ListItem, Text, UnorderedList } from '@chakra-ui/react';
import { ScrollContainer } from 'src/components/scroll-container';
import { Sample } from 'src/utils/api/types';
import { formatUnitText, formatValue } from '../helpers';
import { formatSampleLabelFromProperty } from 'src/utils/formatting/formatSample';

interface SampleQuantityProps {
  data: Sample['sampleQuantity'];
}

export const SampleQuantity = ({ data }: SampleQuantityProps) => {
  const sampleQuantity = {
    label: formatSampleLabelFromProperty('sampleQuantity'),
    list: {
      caption: 'List of sample quantities.',
      data: (Array.isArray(data) ? data : data ? [data] : []).map(item => ({
        ...item,
        // Include unit text if available
        valueText: (() => {
          const valueStr = formatValue({
            value: item.value,
            minValue: item.minValue,
            maxValue: item.maxValue,
          });

          if (!item.unitText) return valueStr;

          return `${valueStr} ${formatUnitText(item.unitText)}(s)`;
        })(),
      })),
    },
  };
  if (sampleQuantity.list.data.length === 0) return null;
  return (
    <>
      <Heading as='h4' fontSize='sm' mx={1} mb={2} fontWeight='semibold'>
        {sampleQuantity.label}
      </Heading>
      <ScrollContainer
        maxHeight='300px'
        border='0.15px solid'
        pr={0}
        borderColor='gray.100'
      >
        <UnorderedList ml={0}>
          {sampleQuantity.list.data.map((item, idx) => {
            const name = formatUnitText(item.name);
            return (
              <ListItem
                key={item.name ?? item.valueText}
                wordBreak='break-all'
                lineHeight='short'
                fontSize='sm'
                bg={idx % 2 === 0 ? 'white' : 'page.alt'}
                p={2}
                borderBottom='0.15px solid'
                borderColor='gray.100'
              >
                {name && (
                  <Text as='span' fontWeight='medium'>
                    {name.charAt(0).toUpperCase() + name.slice(1)}:{' '}
                  </Text>
                )}
                {item.valueText}
              </ListItem>
            );
          })}
        </UnorderedList>
      </ScrollContainer>
    </>
  );
};
