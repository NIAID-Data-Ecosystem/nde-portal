import React from 'react';
import { Box, Button } from 'nde-design-system';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react';

export interface AdvancedSearchModalProps extends ModalProps {
  isOpen: boolean;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  children,
  colorScheme = 'primary',
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
        <ModalFooter>
          <Button
            colorScheme={colorScheme}
            mr={3}
            onClick={onClose}
            variant='ghost'
          >
            Close
          </Button>
          <Button colorScheme={colorScheme}>Submit</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
