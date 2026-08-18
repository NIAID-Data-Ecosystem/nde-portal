import React from 'react';
import { ModalProps, Dialog, Portal } from '@chakra-ui/react';
import { Dialog, Portal } from '@chakra-ui/react';
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
    return null;
  }
  return (
    <Dialog.Root
      open={isOpen}
      size='xl'
      {...props}
      onOpenChange={e => {
        if (!e.open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <VisualizationCardHeading label={label} />
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>{children}</Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
