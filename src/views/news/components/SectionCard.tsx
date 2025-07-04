import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Heading,
  Tag,
  Text,
} from '@chakra-ui/react';
import { NewsOrEventsObject } from 'src/pages/updates';
import ReactMarkdown from 'react-markdown';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import { formatDate } from 'src/utils/api/helpers';

interface SectionCardProps extends NewsOrEventsObject {}

const SectionCard = (attributes: SectionCardProps) => {
  const categoryColors = [
    'gray',
    'blue',
    'orange',
    'gray',
    'purple',
    'green',
    'red',
    'teal',
    'pink',
    'yellow',
    'cyan',
  ];
  const MDXComponents = useMDXComponents();
  return (
    <Card
      id={attributes.slug}
      border='1px solid'
      borderColor='gray.100'
      boxShadow='none'
    >
      <Flex p={2} flexWrap={['wrap', 'nowrap']}>
        {(attributes.publishedAt || attributes.updatedAt) && (
          <Text
            px={[2, 4]}
            pb={[2, 4]}
            pt={1.5}
            fontWeight='medium'
            fontSize='sm'
            whiteSpace='nowrap'
            color='gray.800'
          >
            {formatDate(attributes.publishedAt || attributes.updatedAt)}
          </Text>
        )}
        <Box p={2}>
          <Heading as='h3' fontWeight='semibold' fontSize='xl'>
            {attributes.name}
          </Heading>
          {attributes.subtitle && (
            <Heading
              as='h4'
              fontWeight='semibold'
              size='sm'
              color='gray.700'
              my={0}
              mt={1}
              lineHeight='short'
            >
              {attributes.subtitle}
            </Heading>
          )}
          {attributes.description && (
            <CardBody p={0} lineHeight='short'>
              {/* useful for client-side fetch mdx handling */}
              <ReactMarkdown components={MDXComponents}>
                {attributes.description}
              </ReactMarkdown>
            </CardBody>
          )}
          {attributes.categories && attributes.categories.length > 0 && (
            <CardFooter p={0} mt={2}>
              {attributes.categories.map((category, i) => {
                const { name } = category;
                return (
                  <Tag
                    key={category.id}
                    m={1}
                    colorScheme={
                      categoryColors[category.id % categoryColors.length]
                    }
                    variant='subtle'
                    size='sm'
                  >
                    {name}
                  </Tag>
                );
              })}
            </CardFooter>
          )}
        </Box>
      </Flex>
    </Card>
  );
};

export default SectionCard;
