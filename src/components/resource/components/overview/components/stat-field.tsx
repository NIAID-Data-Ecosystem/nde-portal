import React from 'react';
import {
  Box,
  Flex,
  FlexProps,
  Heading,
  Icon,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Text,
  Tooltip,
} from 'nde-design-system';
import {IconType} from 'react-icons';
import {FaInfoCircle} from 'react-icons/fa';
import LoadingSpinner from 'src/components/loading';

interface MetadataStatProps extends FlexProps {
  label: string;
  value?: string[] | string | number | null;
  icon?: IconType;
  isLoading: boolean;
  info?: string;
}

const StatField: React.FC<MetadataStatProps> = ({
  children,
  icon,
  isLoading,
  label,
  value,
  info,
  ...rest
}) => {
  const StatText = () => {
    if (typeof children === 'number') {
      return <StatNumber>{children}</StatNumber>;
    }
    return <dd>{children || '-'}</dd>;
  };
  return (
    <Stat {...rest}>
      <Flex flexDirection='column'>
        <StatLabel>
          <span style={{display: 'flex', alignItems: 'center'}}>
            {label}
            {icon && <Icon as={icon} color='gray.500' mx={1} />}

            {info && (
              <Tooltip
                aria-label={`Tooltip for ${label}`}
                label={info}
                hasArrow
                placement='top'
              >
                <span>
                  <Icon
                    as={FaInfoCircle}
                    color='primary.600'
                    mx={2}
                    cursor='pointer'
                  />
                </span>
              </Tooltip>
            )}
          </span>
        </StatLabel>
        {isLoading ? (
          <LoadingSpinner
            isLoading={isLoading}
            size='md'
            justifyContent='start'
            px={0}
          />
        ) : (
          <StatText />
        )}
      </Flex>
    </Stat>
  );
};

export default StatField;
