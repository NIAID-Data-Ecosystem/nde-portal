import React from 'react';
import {
  Flex,
  FlexProps,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
} from 'nde-design-system';
import {IconType} from 'react-icons';

import {FaInfo, FaInfoCircle} from 'react-icons/fa';
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
                    as={FaInfo}
                    mx={2}
                    color='accent.bg'
                    border='0.5px solid'
                    borderRadius='100%'
                    p={1}
                    boxSize={5}
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
            justifyContent='flex-start'
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
