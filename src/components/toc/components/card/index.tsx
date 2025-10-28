import {
  Box,
  Card as ChakraCard,
  Flex,
  Image,
  Stack,
  StackProps,
  Text,
  TextProps,
  VStack,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ArrowButton } from 'src/components/button.tsx/arrow-button';
import { MDXComponents as DefaultMDXComponents } from 'src/components/mdx/components';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';

import { TOCCardProps } from './types';

export const CardStack: React.FC<StackProps> = ({ children, ...props }) => {
  return (
    <VStack
      gap={6}
      mt={4}
      alignItems={{ base: 'center', lg: 'flex-start' }}
      flex={1}
      maxWidth={{ base: '400px', sm: 'unset' }}
      {...props}
    >
      {children}
    </VStack>
  );
};

export const CardMarkdownContent = ({ children }: { children: string }) => {
  const MDXComponents = useMDXComponents({
    p: props => DefaultMDXComponents.p({ ...props, fontSize: 'sm', mt: 0 }),
  });
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, remarkGfm]}
      components={MDXComponents}
    >
      {children}
    </ReactMarkdown>
  );
};

export const CardSubtitle = (props: TextProps) => {
  return (
    <Text
      fontSize='sm'
      lineHeight='short'
      opacity='0.8'
      color='text.body'
      {...props}
    />
  );
};

type CardFooterProps = TOCCardProps['footerProps'] & {
  cta: TOCCardProps['cta'];
};
export const CardFooter = ({ cta, ...footerProps }: CardFooterProps) => {
  return (
    <ChakraCard.Footer
      flexDirection='column'
      alignItems='flex-start'
      {...footerProps}
    >
      {cta?.map((cta, index) => {
        return (
          <ArrowButton
            key={index}
            height='unset'
            whiteSpace='initial'
            textProps={{ truncate: false, lineHeight: 'short' }}
            {...cta}
          >
            {cta.children}
          </ArrowButton>
        );
      })}
    </ChakraCard.Footer>
  );
};

export const Card = ({
  title,
  subtitle,
  tags,
  image,
  cta,
  children,
  footerProps,
  ...props
}: TOCCardProps) => {
  return (
    <ChakraCard.Root
      variant='outline'
      size='md'
      overflow='hidden'
      w='100%'
      maxWidth={{
        base: 'lg',
        md: 'unset',
      }}
      css={{
        containerType: 'inline-size',
        '& .card-stack': {
          flexDirection: 'column',
        },
        '@container (min-width: 650px)': {
          '& .card-stack': {
            flexDirection: 'row',
          },
          '& .card-stack .img-container': {
            minWidth: '250px',
            maxWidth: '30%',
            flex: 1,
          },
        },
      }}
      {...props}
    >
      <Stack className='card-stack'>
        {image && (
          <Flex className='img-container'>
            <Image
              objectFit='cover'
              src={image.src}
              alt={image.alt}
              width='100%'
              flex={1}
            />
          </Flex>
        )}
        <Flex flex={2} flexDirection='column'>
          <ChakraCard.Body gap={2} minWidth={{ base: 'unset', sm: '400px' }}>
            <Box>
              <ChakraCard.Title mb={0}>
                {title} {tags}
              </ChakraCard.Title>
              {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
            </Box>

            {children}
          </ChakraCard.Body>
          {/* Footer: Optional call to action buttons */}
          {cta?.length && <CardFooter cta={cta} {...footerProps} />}
        </Flex>
      </Stack>
    </ChakraCard.Root>
  );
};
