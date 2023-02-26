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
  isDisabled: boolean;
  onSubmit?: (e: React.FormEvent<HTMLButtonElement>) => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  children,
  colorScheme = 'primary',
  onSubmit,
  isDisabled,
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
          {onClose && onSubmit && (
            <Button
              colorScheme={colorScheme}
              mr={3}
              onClick={onClose}
              variant='outline'
              size='md'
            >
              Close
            </Button>
          )}
          {onSubmit && (
            <Button
              colorScheme={colorScheme}
              onClick={e => {
                onSubmit(e);
              }}
              isDisabled={isDisabled}
              size='md'
            >
              Submit
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
