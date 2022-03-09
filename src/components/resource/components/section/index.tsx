import React from 'react';
import {
  Box,
  BoxProps,
  Flex,
  FlexProps,
  Heading,
  Icon,
  Skeleton,
  Text,
} from 'nde-design-system';
import {StyledSectionHead, StyledSectionHeading} from './styles';
import {IconType} from 'react-icons';

interface MetadataFieldProps extends FlexProps {
  label: string;
  value?: string[] | string | number | null;
  icon?: IconType;
  isLoading: boolean;
}

const MetadataField: React.FC<MetadataFieldProps> = ({
  children,
  icon,
  isLoading,
  label,
  value,
  ...rest
}) => {
  if (!isLoading && !(value || children)) {
    return <></>;
  }
  return (
    <Skeleton isLoaded={!isLoading}>
      <Flex
        minW={150}
        flexDirection={typeof value === 'number' ? 'column' : 'column-reverse'}
        {...rest}
      >
        {(typeof value === 'string' || typeof value === 'number') && (
          <Heading
            size={typeof value === 'number' ? 'lg' : 'sm'}
            fontFamily='body'
            fontWeight='semibold'
          >
            {value}
          </Heading>
        )}

        {Array.isArray(value) &&
          value.map(v => (
            <Heading
              size={typeof value === 'number' ? 'lg' : 'sm'}
              fontFamily='body'
              fontWeight='semibold'
            >
              {v}
            </Heading>
          ))}
        {children}

        <Text fontSize='xs' color='gray.800' display='flex' alignItems='center'>
          {icon && <Icon as={icon} color='gray.900' mr={2} boxSize={4} />}{' '}
          {label}
        </Text>
      </Flex>
    </Skeleton>
  );
};

interface SectionProps extends BoxProps {
  id: string;
  name?: string;
  color?: string;
  bg?: string;
}
const Section: React.FC<SectionProps> = ({
  id,
  name,
  children,
  color,
  bg,
  ...props
}) => {
  return (
    <section id={id}>
      {name && (
        <StyledSectionHead color={color} bg={bg}>
          <StyledSectionHeading>{name}</StyledSectionHeading>
        </StyledSectionHead>
      )}
      <Box p={4} {...props}>
        {children}
      </Box>
    </section>
  );
};
export {Section, MetadataField};
