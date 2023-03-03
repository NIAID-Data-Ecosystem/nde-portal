import React, { useState } from 'react';
import {
  Box,
  Flex,
  FlexProps,
  Heading,
  Icon,
  Text,
  useBreakpointValue,
} from 'nde-design-system';
import { IconType } from 'react-icons';
import { FaInfo } from 'react-icons/fa';
import LoadingSpinner from 'src/components/loading';
import { IconProps } from 'src/components/icon';
import { formatNumber } from 'src/utils/helpers';
import Tooltip from 'src/components/tooltip';

interface MetadataStatProps extends FlexProps {
  label: string;
  icon?: IconType | ((args: IconProps) => React.ReactElement);
  isLoading: boolean;
  description?: string | React.ReactNode;
}

const StatField: React.FC<MetadataStatProps> = ({
  children,
  icon,
  isLoading,
  label,
  description,
  ...rest
}) => {
  const isMobile = useBreakpointValue({ base: true, sm: false });
  // on mobile and for assistive devices we want to allow
  const [isTooltipOpen, setTooltipOpen] = useState(false);
  const StatText = () => {
    if (React.Children.count(children) > 1) {
      return <>{children}</>;
    }
    if (typeof children === 'number') {
      return <Text size='sm'>{formatNumber(children)}</Text>;
    }
    return (
      <Text as='div' fontSize='sm' lineHeight='short' mt={1}>
        {children || '-'}
      </Text>
    );
  };

  return (
    <Box as='div' p={2} w='100%' m={0.5} {...rest}>
      <Flex flexDirection='column'>
        <Flex>
          {label && (
            <Heading
              as='h6'
              size='h6'
              color='gray.800'
              fontSize='xs'
              lineHeight='shorter'
              fontWeight='medium'
              whiteSpace='nowrap'
              mb={1}
              onClick={() => isMobile && setTooltipOpen(!isTooltipOpen)}
            >
              <Tooltip
                aria-label={`Tooltip for ${label}`}
                label={description}
                hasArrow
                placement='top'
                isOpen={isMobile ? isTooltipOpen : undefined}
                closeDelay={300}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: description ? 'pointer' : 'default',
                  }}
                >
                  {icon && <Icon as={icon} color='gray.500' mx={1} />}
                  {label}
                  {/* button used here to allow user to focus on tooltip*/}
                  {description && (
                    <button aria-label={label}>
                      <Icon
                        as={FaInfo}
                        mx={2}
                        color='gray.800'
                        border='0.625px solid'
                        borderRadius='100%'
                        p={0.5}
                        boxSize='0.85rem'
                      />
                    </button>
                  )}
                </span>
              </Tooltip>
            </Heading>
          )}
        </Flex>
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
    </Box>
  );
};

export default StatField;
