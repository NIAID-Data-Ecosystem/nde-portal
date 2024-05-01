import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Heading,
  Image,
  Tag,
  Text,
} from '@chakra-ui/react';
import { NewsOrEventsObject } from 'src/pages/news';
import ReactMarkdown from 'react-markdown';
import { useMDXComponents } from 'mdx-components';
import { formatDate } from 'src/utils/api/helpers';
import { Link } from 'src/components/link';

interface SectionCardProps extends NewsOrEventsObject {
  image?: { url: string; alternativeText: string } | null;
}

const SectionCard = ({ attributes, image }: SectionCardProps) => {
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
  const MDXComponents = useMDXComponents({
    a: (props: any) => {
      return (
        <Link
          href={props.href}
          // External links should open in a new tab if not on the same domain.
          isExternal={
            (props.href.startsWith('/') ||
              props.href.startsWith(process.env.NEXT_PUBLIC_BASE_URL)) &&
            props.target !== '_blank'
              ? false
              : true
          }
          textDecoration='underline'
          _hover={{ textDecoration: 'none' }}
        >
          {props.children}
        </Link>
      );
    },
  });

  return (
    <Card
      id={attributes.slug}
      border='1px solid'
      borderColor='gray.100'
      boxShadow='none'
    >
      <Flex p={2} flexWrap={['wrap', 'nowrap']}>
        {image && (
          <Image
            objectFit='contain'
            w='200px'
            px={4}
            src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${image.url}`}
            alt={image.alternativeText}
          />
        )}
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
