import { Accordion, BoxProps, Icon, Skeleton } from '@chakra-ui/react';
import React from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

import { StyledSectionHead, StyledSectionHeading } from './styles';

interface SectionProps extends BoxProps {
  id: string;
  name?: string;
  color?: string;
  bg?: string;
  isCollapsible?: boolean;
  isDefaultOpen?: boolean;
  loading?: boolean;
}

const Section: React.FC<SectionProps> = ({
  id,
  loading,
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
        loading={!!loading}
        height={loading ? '200px' : 'unset'}
        p={{ base: 0, sm: 4 }}
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
        <Accordion.Root
          collapsible
          defaultValue={isDefaultOpen ? ['section-0'] : undefined}
        >
          <Accordion.Item
            borderColor='transparent'
            border={'none'}
            value='section-0'
          >
            <Accordion.ItemContext>
              {({ expanded }) => (
                <>
                  {name && (
                    <h2>
                      <Accordion.ItemTrigger
                        aria-label={`show more details about ${name}`}
                        bg={bg || expanded ? 'bg.alt' : 'white'}
                        color={color}
                        borderY='0.5px solid'
                        borderColor='gray.100'
                        borderLeft='3px solid'
                        borderLeftColor='accent.400'
                        _hover={{ bg: props?._hover?.bg || 'bg.alt' }}
                        _expanded={{
                          borderColor: 'bg.alt',
                        }}
                      >
                        {name && (
                          <StyledSectionHeading flex={1} textAlign='left'>
                            {name}
                          </StyledSectionHeading>
                        )}
                        <Icon as={expanded ? FaMinus : FaPlus} fontSize='xs' />
                      </Accordion.ItemTrigger>
                    </h2>
                  )}
                  <Accordion.ItemContent>
                    <Accordion.ItemBody>
                      <Content />
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </>
              )}
            </Accordion.ItemContext>
          </Accordion.Item>
        </Accordion.Root>
      </section>
    );
  }

  return (
    <section id={id} style={{ padding: 0 }}>
      {name && (
        <StyledSectionHead color={color} px={4}>
          <StyledSectionHeading>{name}</StyledSectionHeading>
        </StyledSectionHead>
      )}

      <Content />
    </section>
  );
};
export default Section;
