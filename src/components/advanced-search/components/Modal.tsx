import React from 'react';
import { Box, ModalProps, Dialog, Portal } from '@chakra-ui/react';

export interface AdvancedSearchModalProps extends Omit<ModalProps, 'onClose'> {
  isOpen: boolean;
  handleClose: ModalProps['onClose'];
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  children,
  colorPalette = 'primary',
  isOpen,
  handleClose,
  ...props
}) => {
  return (
    <Dialog.Root
      open={isOpen}
      preventScroll={false}
      size='xl'
      {...props}
      onOpenChange={e => {
        if (!e.open) {
          handleClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop height='100vh' />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Advanced Search</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Box>{children}</Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
