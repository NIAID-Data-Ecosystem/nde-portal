import { Flex, FlexProps, Icon } from '@chakra-ui/react';
import React from 'react';
import { FaComputer } from 'react-icons/fa6';
import { operatingSystemIcons } from 'src/utils/helpers/operating-system-icons';

import Tooltip from '../../../../../../../components/tooltip';

interface OperatingSystemProps extends FlexProps {
  data: string[];
}

const OperatingSystems: React.FC<OperatingSystemProps> = ({ data }) => {
  return (
    <Flex whiteSpace='nowrap' alignItems='start'>
      {data.map((item, index) => {
        const osIcon = operatingSystemIcons.find(obj => obj.os === item)?.icon;

        return (
          <Tooltip
            key={`${item}`}
            content={`Operating system supported: ${item}`}
            showArrow
          >
            <Flex>
              <Icon key={`${item}-${index}`} as={osIcon || FaComputer} mr={2} />
            </Flex>
          </Tooltip>
        );
      })}
    </Flex>
  );
};

export default OperatingSystems;
