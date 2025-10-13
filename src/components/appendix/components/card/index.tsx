import {
  Box,
  Button,
  Card as ChakraCard,
  Flex,
  FlexProps,
  Image,
  Stack,
  StackProps,
  Text,
  VStack,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ArrowButton } from 'src/components/button.tsx/arrow-button';
import { MDXComponents as DefaultMDXComponents } from 'src/components/mdx/components';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';

import { AppendixCardProps } from './types';

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

// export const Card = ({
//   title,
//   subtitle,
//   tags,
//   image,
//   cta,
//   children,
//   ...props
// }: AppendixCardProps) => {
//   return (
//     <ChakraCard.Root
//       variant='outline'
//       // flexDirection={{ base: 'column', md: 'row-reverse' }}
//       // flexWrap='wrap'
//       // overflow='hidden'
//       // maxWidth={{
//       //   base: 'xl',
//       //   xl: 'unset',
//       // }}
//       flexDirection='row'
//       alignItems='unset'
//       flexWrap='wrap-reverse'
//       {...props}
//     >
//       {/* {image && (
//         <>
//           <Image
//             minWidth={250}
//             width='auto'
//             maxWidth={{ base: '100%', lg: '40%' }}
//             maxHeight={{ base: '250px', md: 'none', lg: '272px' }}
//             aspectRatio={{ base: '5/3', xl: '16/9' }}
//             flex={1}
//             objectFit='cover'
//             src={image.src}
//             alt={image.alt}
//             {...image}
//           />
//         </>
//       )} */}
//       <Box flex={1} minWidth={{ base: '250px', sm: '350px' }}>
//         <ChakraCard.Body>
//           <ChakraCard.Title mb='2'>{title}</ChakraCard.Title>
//           {subtitle && (
//             <Text
//               fontWeight='medium'
//               fontSize='sm'
//               lineHeight='short'
//               opacity='0.8'
//             >
//               {subtitle}
//             </Text>
//           )}
//           {children}
//         </ChakraCard.Body>

//         <ChakraCard.Footer
//           justifyContent={{ base: 'center', md: 'flex-end' }}
//           w='100%'
//         >
//           {/* Call to action buttons */}
//           {cta?.map((cta, index) => {
//             return (
//               <ArrowButton
//                 key={index}
//                 maxWidth={{ base: '225px', sm: 'unset' }}
//                 {...cta}
//               >
//                 {cta.children}
//               </ArrowButton>
//             );
//           })}
//         </ChakraCard.Footer>
//       </Box>
//       {image && (
//         <>
//           <Flex
//             minWidth={{ base: 200 }}
//             maxWidth={{ base: 'unset', xl: '25%' }}
//             flex={1}
//             alignItems='flex-start'
//           >
//             <Image
//               borderRadius='md'
//               p={2}
//               width='100%'
//               height='auto'
//               src={image.src}
//               alt={image.alt}
//               objectFit='contain'
//             />
//           </Flex>
//         </>
//       )}
//     </ChakraCard.Root>
//   );
// };

export const Card = ({
  title,
  subtitle,
  tags,
  image,
  cta,
  children,
  ...props
}: AppendixCardProps) => {
  return (
    <ChakraCard.Root variant='outline' size='md' {...props}>
      <Box>
        <Stack flexDirection='row' alignItems='unset' flexWrap='wrap-reverse'>
          <Box flex={1} minWidth={{ base: '250px', sm: '350px' }}>
            <ChakraCard.Body>
              <ChakraCard.Title mb='2'>{title}</ChakraCard.Title>
              {subtitle && (
                <Text
                  fontWeight='medium'
                  fontSize='sm'
                  lineHeight='short'
                  opacity='0.8'
                >
                  {subtitle}
                </Text>
              )}
              {children}
            </ChakraCard.Body>
          </Box>
          {image && (
            <Flex
              minWidth={200}
              maxWidth={{ base: 'unset', xl: '25%' }}
              flex={1}
              alignItems='flex-start'
            >
              <Image
                borderRadius={{ base: 'unset', md: 'md' }}
                width='100%'
                height='auto'
                src={image.src}
                alt={image.alt}
                objectFit='contain'
              />
            </Flex>
          )}
        </Stack>
        <ChakraCard.Footer
          justifyContent={{ base: 'center', md: 'flex-end' }}
          w='100%'
        >
          {/* Call to action buttons */}
          {cta?.map((cta, index) => {
            return (
              <ArrowButton
                key={index}
                maxWidth={{ base: '225px', sm: 'unset' }}
                {...cta}
              >
                {cta.children}
              </ArrowButton>
            );
          })}
        </ChakraCard.Footer>
      </Box>
    </ChakraCard.Root>
  );
};
