import React from 'react';
import { Accordion, Box, BoxProps, Heading, Skeleton } from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { HeadingProps } from 'node_modules/@chakra-ui/react/dist/types/components/typography/heading';

interface SectionProps extends BoxProps {
  id: string;
  name?: string;
  color?: string;
  bg?: string;
  isCollapsible?: boolean;
  isDefaultOpen?: boolean;
  isLoading?: boolean;
}

export const SectionHeader = ({ children, ...boxProps }: BoxProps) => (
  <Box bg='page.alt' {...boxProps}>
    {children}
  </Box>
);

export const SectionTitle = ({ children, ...headingProps }: HeadingProps) => (
  <Heading as='h3' size='md' {...headingProps}>
    {children}
  </Heading>
);

export const Section: React.FC<SectionProps> = ({
  id,
  isLoading,
  name,
  children,
  color,
  bg,
  isCollapsible = false,
  isDefaultOpen = true,
  ...props
}) => {
  const Content = () => {
    return (
      <Skeleton
        loading={isLoading}
        height={isLoading ? '200px' : 'unset'}
        px={{ base: 0, sm: 4 }}
        py={{ base: 0, sm: 2 }}
        {...props}
      >
        {children}
      </Skeleton>
    );
  };

  // if collapsible, the section is an accordion with the section name as the button.
  if (isCollapsible) {
    return (
      <section id={id} style={{ padding: 0 }}>
        <Accordion.Root collapsible defaultValue={isDefaultOpen ? [id] : []}>
          <Accordion.Item value={id} borderColor='gray.100'>
            <Accordion.ItemTrigger
              aria-label={`show more details about ${name}`}
              _open={{
                bg: bg || 'page.alt',
                borderColor: 'page.alt',
              }}
              px={4}
              py={2}
            >
              <>
                {name && (
                  <SectionTitle flex={1} textAlign='left'>
                    {name}
                  </SectionTitle>
                )}
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
              </>
            </Accordion.ItemTrigger>

            <Accordion.ItemContent bg='#fff' borderRadius='none'>
              <Accordion.ItemBody p={0}>
                <Content />
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </section>
    );
  }

  return (
    <section id={id} style={{ padding: 0 }}>
      {name && (
        <SectionHeader color={color}>
          <SectionTitle px={4} py={2}>
            {name}
          </SectionTitle>
        </SectionHeader>
      )}

      <Content />
    </section>
  );
};
