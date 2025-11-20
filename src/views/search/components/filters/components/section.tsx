import { Accordion, Flex, Heading } from '@chakra-ui/react';
import React from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { Tooltip } from 'src/components/tooltip';

interface FiltersSectionProps {
  name: string;
  description: string;
  children: React.ReactNode;
  value: string;
}

/*
[COMPONENT INFO]:
Filter drawer corresponding to a filter facet.
*/
export const FiltersSection: React.FC<FiltersSectionProps> = React.memo(
  ({ name, description, value, children }) => {
    return (
      <Accordion.Item value={value}>
        <Accordion.ItemTrigger
          p={0}
          bg='transparent'
          borderLeft='4px solid'
          borderRadius='none'
          borderTopColor='gray.100'
          borderBottomColor='gray.100'
          borderLeftColor='transparent'
          _open={{
            bg: 'secondary.50',
            borderTopColor: 'secondary.100',
            borderBottomColor: 'transparent',
            borderLeftColor: 'secondary.300',
          }}
        >
          <Tooltip
            content={description.charAt(0).toUpperCase() + description.slice(1)}
          >
            <Flex flex='1' p={4} py={3} alignItems='center'>
              <Heading
                as='span'
                flex='1'
                textAlign='left'
                fontSize='sm'
                fontWeight='medium'
                color='gray.800'
                mr={2}
              >
                {name}
              </Heading>
              <Accordion.ItemIndicator
                as={FaPlus}
                fontSize='12px'
                _open={{ display: 'none' }}
              />
              <Accordion.ItemIndicator
                as={FaMinus}
                fontSize='12px'
                _closed={{ display: 'none' }}
              />
            </Flex>
          </Tooltip>
        </Accordion.ItemTrigger>

        <Accordion.ItemContent bg='#fff' px={0} borderRadius='none'>
          <Accordion.ItemBody
            borderLeft='4px solid'
            borderLeftColor='secondary.200'
          >
            {children}
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    );
  },
);
