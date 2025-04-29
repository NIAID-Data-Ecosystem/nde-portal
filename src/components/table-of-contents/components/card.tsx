import {
  Box,
  Button,
  ButtonProps,
  HStack,
  Icon,
  Skeleton,
  StackProps,
  Text,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { FaChevronRight } from 'react-icons/fa6';

/**
 * StyledCardStack component
 * @description A component that displays a stack of cards with a specified spacing and margin. It is used in the table of contents style pages.
 *
 * @returns {JSX.Element} The rendered StyledCardStack component.
 */
export const StyledCardStack: React.FC<StackProps> = ({
  children,
  ...props
}) => {
  return (
    <VStack spacing={6} mt={4} alignItems='flex-start' {...props}>
      {children}
    </VStack>
  );
};

interface StyledCardProps extends StackProps {
  isLoading?: boolean;
  label?: string;
  subLabel?: string;
  tags?: React.ReactNode;
}

/**
 * StyledCard component
 * @description A component that displays a card with a label, subLabel, and optional tags. It is used in the table of contents style pages.
 *
 * @returns {JSX.Element} The rendered StyledCard component.
 */

export const StyledCard: React.FC<StyledCardProps> = ({
  id,
  isLoading,
  label,
  subLabel,
  children,
  tags,
}) => {
  return (
    <StyledCardWrapper id={id} isLoading={isLoading}>
      <HStack spacing={2}>
        {label && <StyleCardLabel>{label}</StyleCardLabel>}
        {tags}
      </HStack>
      {subLabel && <StyleCardSubLabel>{subLabel}</StyleCardSubLabel>}
      <VStack alignItems='flex-start' lineHeight='short' mt={2}>
        {children}
      </VStack>
    </StyledCardWrapper>
  );
};

export const StyledCardWrapper: React.FC<
  StackProps & { isLoading?: boolean }
> = ({ children, id, isLoading, ...props }) => {
  return (
    <Skeleton
      as='section'
      id={id}
      isLoaded={!isLoading}
      minHeight={isLoading ? '200px' : 'unset'}
      w='100%'
      boxShadow='low'
      borderRadius='semi'
      borderColor='gray.200'
      py={4}
      px={[4, 6, 8]}
      fontSize='sm'
      {...props}
    >
      {children}
    </Skeleton>
  );
};

export const StyleCardLabel: React.FC<{ children: string }> = ({
  children,
}) => {
  return (
    <Text fontWeight='bold' color='text.heading' fontSize='xl'>
      {children}
    </Text>
  );
};

export const StyleCardSubLabel: React.FC<{ children: string }> = ({
  children,
}) => {
  return (
    <Text fontWeight='mediunm' fontSize='sm' lineHeight='short' opacity='0.8'>
      {children}
    </Text>
  );
};

export const StyledCardDescription: React.FC<{ children: string }> = ({
  children,
}) => {
  return <Text lineHeight='tall'>{children}</Text>;
};

export const StyledCardButton: React.FC<
  ButtonProps & { children: React.ReactNode }
> = ({ children, ...props }) => {
  return (
    <Box
      _hover={{
        svg: {
          transform: 'translateX(0)',
          transition: 'all .3s ease',
        },
      }}
    >
      <Button
        size='sm'
        rightIcon={
          <Icon
            as={FaChevronRight}
            boxSize={3}
            ml='2px'
            transition='all .3s ease'
            transform='translateX(-5px)'
          />
        }
        wordBreak='break-word'
        whiteSpace='normal'
        textAlign='center'
        height='unset'
        width={{ base: '100%', md: 'unset' }}
        colorScheme='primary'
        {...props}
      >
        {children}
      </Button>
    </Box>
  );
};
