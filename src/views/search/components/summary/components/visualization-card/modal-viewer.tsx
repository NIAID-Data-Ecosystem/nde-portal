import { Dialog, Portal } from '@chakra-ui/react';
import React from 'react';

import { VisualizationCardHeading } from './card-header';

interface ModalViewerProps extends Dialog.RootProps {
  children: React.ReactNode;
  label: string;
}

export const ModalViewer: React.FC<ModalViewerProps> = ({
  children,
  label,
  open,
  onOpenChange,
  ...props
}) => {
  if (!open) {
    return null;
  }
  return (
    <Dialog.Root open={open} size='xl' {...props} onOpenChange={onOpenChange}>
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
