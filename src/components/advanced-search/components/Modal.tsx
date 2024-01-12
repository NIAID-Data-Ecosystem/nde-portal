import React from 'react';
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react';

export interface AdvancedSearchModalProps extends Omit<ModalProps, 'onClose'> {
  isOpen: boolean;
  handleClose: ModalProps['onClose'];
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  children,
  colorScheme = 'primary',
  isOpen,
  handleClose,
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      blockScrollOnMount={false}
      size='5xl'
      {...props}
    >
      <ModalOverlay height='100vh' />
      <ModalContent>
        <ModalHeader>Advanced Search</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>{children}</Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
