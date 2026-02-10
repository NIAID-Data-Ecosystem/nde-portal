import React from 'react';
import { ModalProps } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { VisualizationCardHeading } from './card-header';

interface ModalViewerProps extends ModalProps {
  children: React.ReactNode;
  label: string;
}

export const ModalViewer: React.FC<ModalViewerProps> = ({
  children,
  label,
  isOpen,
  onClose,
  ...props
}) => {
  if (!isOpen) {
    return children;
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl' {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VisualizationCardHeading label={label} />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
};
