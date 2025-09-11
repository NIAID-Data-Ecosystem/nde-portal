import { Flex, Icon } from '@chakra-ui/react';
import React from 'react';
import {
  FaCheck,
  FaCircleExclamation,
  FaTriangleExclamation,
  FaXmark,
} from 'react-icons/fa6';

interface BannerProps {
  status?: 'info' | 'success' | 'warning' | 'error';
  children?: React.ReactNode;
}

// [COMPONENT INFO]: Banner Element to notice user. NIAID design specs: https://designsystem.niaid.nih.gov/components/molecules
const Banner: React.FC<BannerProps> = ({ children, status }) => {
  let bg = 'info.light';
  let icon_bg = 'info.default';

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
      return FaXmark;
    } else if (status === 'success') {
      return FaCheck;
    } else if (status === 'warning') {
      return FaTriangleExclamation;
    } else if (status === 'info') {
      return FaCircleExclamation;
    } else {
      return FaCircleExclamation;
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
