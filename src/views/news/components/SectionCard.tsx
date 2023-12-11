import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Flex,
  Heading,
  Tag,
  Text,
} from 'nde-design-system';
import { NewsOrEventsObject } from 'src/pages/news';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useMDXComponents } from 'mdx-components';
import { formatDate } from 'src/utils/api/helpers';

const SectionCard = ({ attributes }: NewsOrEventsObject) => {
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
  const MDXComponents = useMDXComponents({});

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
            p={[2, 4]}
            fontWeight='medium'
            fontSize='sm'
            whiteSpace='nowrap'
            color='gray.800'
          >
            {formatDate(attributes.publishedAt || attributes.updatedAt)}
          </Text>
        )}
        <Box p={2}>
          <CardTitle as='h3'>{attributes.name}</CardTitle>
          {attributes.subtitle && (
            <Heading
              as='h4'
              fontWeight='semibold'
              size='sm'
              color='gray.700'
              my={0}
            >
              {attributes.subtitle}
            </Heading>
          )}
          <CardBody p={0}>
            {/* useful for client-side fetch mdx handling */}
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              linkTarget='_blank'
              components={MDXComponents}
            >
              {`${attributes.description}`}
            </ReactMarkdown>
          </CardBody>
          {attributes.categories && attributes.categories.data.length > 0 && (
            <CardFooter p={0} mt={2}>
              {attributes.categories.data.map((category, i) => {
                const { name } = category.attributes;
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
