import React, { useState } from 'react';
import {
  Flex,
  FlexProps,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
  useBreakpointValue,
} from 'nde-design-system';
import { IconType } from 'react-icons';
import { FaInfo } from 'react-icons/fa';
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
  const isMobile = useBreakpointValue({ base: true, sm: false });
  // on mobile and for assistive devices we want to allow
  const [isTooltipOpen, setTooltipOpen] = useState(false);
  const StatText = () => {
    if (typeof children === 'number') {
      return <StatNumber>{children}</StatNumber>;
    }
    return <dd>{children || '-'}</dd>;
  };

  return (
    <Stat {...rest}>
      <Flex flexDirection='column'>
        <StatLabel onClick={() => isMobile && setTooltipOpen(!isTooltipOpen)}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {label}
            {icon && <Icon as={icon} color='gray.500' mx={1} />}

            {info && (
              <Tooltip
                aria-label={`Tooltip for ${label}`}
                label={info}
                hasArrow
                placement='top'
                isOpen={isMobile ? isTooltipOpen : undefined}
                closeDelay={300}
              >
                {/* button used here to allow user to focus on tooltip*/}
                <button>
                  <Icon
                    as={FaInfo}
                    mx={2}
                    color='gray.700'
                    border='0.625px solid'
                    borderRadius='100%'
                    p={0.5}
                    boxSize={4}
                    cursor='pointer'
                  />
                </button>
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
