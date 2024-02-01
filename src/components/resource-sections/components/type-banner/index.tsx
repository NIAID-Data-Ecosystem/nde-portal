import React from 'react';
import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa6';
import { FormattedResource } from 'src/utils/api/types';

const StyledLabel = ({ children, ...props }: FlexProps) => {
  return (
    <Flex
      lineHeight={1.5}
      position='relative'
      zIndex={0}
      mx={2}
      p={2}
      _before={{
        content: '""',
        bg: props?._before?.bg ? props?._before?.bg : 'status.info',
        boxShadow: '0 0 0 5px #fff',
        display: 'block',
        height: '2.5rem',
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'skew(-12deg)',
        width: '100%',
        zIndex: -4,
      }}
    >
      {children}
    </Flex>
  );
};

interface TypeBannerProps extends FlexProps {
  type?: FormattedResource['type'];
  date?: FormattedResource['date'];
  sourceName?: string[] | null;
  isNiaidFunded?: boolean;
}

export const getTypeColor = (type: FormattedResource['type']) => {
  if (!type) {
    return;
  } else if (type.toLowerCase() === 'dataset') {
    return 'status.info';
  } else if (
    type.toLowerCase().includes('tool') ||
    type.toLowerCase().includes('software')
  ) {
    return 'primary.800';
  }
  return 'niaid.color';
};

const TypeBanner: React.FC<TypeBannerProps> = ({
  type,
  date,
  children,
  pl,
  isNiaidFunded,
  ...props
}) => {
  return (
    <Flex
      className='type-banner'
      flexWrap='wrap'
      w='100%'
      bg={props.bg || 'status.info_lt'}
      {...props}
    >
      <Flex
        bg={props.bg || 'status.info_lt'}
        px={{ base: 2, lg: 4 }}
        pl={pl}
        py={0}
        overflow='hidden'
        minW='250px'
      >
        {type && (
          <StyledLabel
            _before={{
              bg: getTypeColor(type),
            }}
          >
            <Text
              fontSize='xs'
              color='white'
              px={2}
              fontWeight='semibold'
              whiteSpace='nowrap'
            >
              {type.toUpperCase()}
            </Text>
          </StyledLabel>
        )}
        {isNiaidFunded && (
          <StyledLabel
            _before={{
              bg: 'niaid.color',
            }}
          >
            <Text
              fontSize='xs'
              color='white'
              px={2}
              fontWeight='semibold'
              whiteSpace='nowrap'
            >
              NIAID
            </Text>
          </StyledLabel>
        )}
      </Flex>
      <Flex
        bg={props.bg || 'status.info_lt'}
        overflow='hidden'
        flex={1}
        minW='250px'
      >
        {date && (
          <Flex alignItems='center' px={{ base: 2, lg: 4 }} py={[2, 1]}>
            <Icon as={FaRegClock} mr={2}></Icon>
            <Text fontSize='xs' fontWeight='semibold' whiteSpace='nowrap'>
              {date}
            </Text>
          </Flex>
        )}
        {children}
      </Flex>
    </Flex>
  );
};

export default TypeBanner;
