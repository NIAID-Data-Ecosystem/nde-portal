import React from 'react';
import {
  Flex,
  FlexProps,
  Heading,
  Icon,
  Skeleton,
  Text,
} from 'nde-design-system';
import {IconType} from 'react-icons';

interface Stat extends FlexProps {
  label: string;
  value?: string | number | null;
  icon?: IconType;
  isLoading: boolean;
}

const Stat: React.FC<Stat> = ({
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
    <Skeleton m={2} isLoaded={!isLoading}>
      <Flex
        minW={150}
        flexDirection={typeof value === 'number' ? 'column' : 'column-reverse'}
        {...rest}
      >
        {value && (
          <Heading
            size={typeof value === 'number' ? 'lg' : 'sm'}
            fontFamily='body'
            fontWeight='semibold'
          >
            {value}
          </Heading>
        )}
        {children}

        <Text fontSize='xs' color='gray.800' display='flex' alignItems='center'>
          {icon && <Icon as={icon} color='gray.900' mr={2} boxSize={4} />}{' '}
          {label}
        </Text>
      </Flex>
    </Skeleton>
  );
};

export default Stat;
