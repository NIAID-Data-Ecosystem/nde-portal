import {
  Box,
  HStack,
  Skeleton,
  StackProps,
  Text,
  VStack,
} from '@chakra-ui/react';

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

export const StyledCard: React.FC<StyledCardProps> = ({
  id,
  isLoading,
  label,
  subLabel,
  children,
  tags,
}) => {
  return (
    <Skeleton
      isLoaded={!isLoading}
      w='100%'
      minHeight={isLoading ? '200px' : 'unset'}
    >
      <VStack
        key={id}
        id={id}
        as='section'
        alignItems='flex-start'
        boxShadow='low'
        borderRadius='semi'
        borderColor='gray.200'
        py={4}
        px={[4, 6, 8]}
        spacing={2}
      >
        <Box>
          <HStack spacing={2}>
            {label && (
              <Text fontWeight='bold' color='text.heading' fontSize='xl'>
                {label}
              </Text>
            )}
            {tags}
          </HStack>
          {subLabel && (
            <Text fontWeight='semibold' fontSize='sm' lineHeight='short'>
              {subLabel}
            </Text>
          )}
        </Box>
        {children}
      </VStack>
    </Skeleton>
  );
};
