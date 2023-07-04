import { Flex, Icon } from 'nde-design-system';
import React from 'react';
import {
  FaCheck,
  FaExclamationTriangle,
  FaTimes,
  FaInfoCircle,
} from 'react-icons/fa';

interface BannerProps {
  status?: 'info' | 'success' | 'warning' | 'error';
}

// [COMPONENT INFO]: Banner Element to notice user. NIAID design specs: https://designsystem.niaid.nih.gov/components/molecules
const Banner: React.FC<BannerProps> = ({ children, status }) => {
  let bg = 'status.info_lt';
  let icon_bg = 'status.info';

  if (
    status === 'info' ||
    status === 'error' ||
    status === 'warning' ||
    status === 'success'
  ) {
    bg = `status.${status}_lt`;
    icon_bg = `status.${status}`;
  }

  const getIcon = (status: BannerProps['status']) => {
    if (status === 'error') {
      return FaTimes;
    } else if (status === 'success') {
      return FaCheck;
    } else if (status === 'warning') {
      return FaExclamationTriangle;
    } else if (status === 'info') {
      return FaInfoCircle;
    } else {
      return FaInfoCircle;
    }
  };

  return (
    <Flex
      bg={bg}
      borderRadius='semi'
      boxShadow='low'
      p={8}
      pt={10}
      mt={8}
      position='relative'
    >
      <Flex
        bg={icon_bg}
        w='2.5rem'
        h='2.5rem'
        justifyContent='center'
        alignItems='center'
        borderRadius='100%'
        boxShadow='low'
        position='absolute'
        top={0}
        left='1.25rem'
        transform='translate(0, -50%)'
      >
        <Icon
          as={getIcon(status)}
          color={status === 'warning' ? '#000' : '#fff'}
          fontSize='1.5rem'
        />
      </Flex>
      {children}
    </Flex>
  );
};

export default Banner;
