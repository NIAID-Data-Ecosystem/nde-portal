import { Flex, FlexProps, Icon } from '@chakra-ui/react';
import React from 'react';
import { FaComputer } from 'react-icons/fa6';
import { Tooltip } from 'src/components/tooltip';
import { operatingSystemIcons } from 'src/utils/helpers/operating-system-icons';

interface OperatingSystemProps extends FlexProps {
  data: string[];
}

const OperatingSystems: React.FC<OperatingSystemProps> = ({ data }) => {
  return (
    <Flex whiteSpace='nowrap' alignItems='start'>
      {data.map(item => {
        const osIcon = operatingSystemIcons.find(obj => obj.os === item)?.icon;

        return (
          <Tooltip
            key={`${item}`}
            content={`Operating system supported: ${item}`}
          >
            <Flex>
              <Icon as={osIcon || FaComputer} mr={2} />
            </Flex>
          </Tooltip>
        );
      })}
    </Flex>
  );
};

export default OperatingSystems;
