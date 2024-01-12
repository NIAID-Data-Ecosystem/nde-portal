import React from 'react';
import {
  Button,
  ButtonProps,
  ModalProps,
  useDisclosure,
} from '@chakra-ui/react';
import { AdvancedSearchModal } from './components/Modal';
import { AdvancedSearchOpen } from './components/buttons';
import { AdvancedSearchProps } from '.';
import dynamic from 'next/dynamic';

const AdvancedSearch = dynamic(() =>
  import('./index').then(mod => mod.AdvancedSearch),
);

interface AdvancedSearchPropsWithModal extends AdvancedSearchProps {
  buttonProps?: ButtonProps;
  modalProps?: ModalProps;
}

export const AdvancedSearchWithModal: React.FC<
  AdvancedSearchPropsWithModal
> = ({ buttonProps, modalProps, ...props }) => {
  // Handles the opening of the modal.
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <AdvancedSearchOpen onClick={onOpen} {...buttonProps} />

      <AdvancedSearchModal
        isOpen={isOpen}
        handleClose={onClose}
        {...modalProps}
      >
        {isOpen && (
          <AdvancedSearch
            onValidSubmit={onClose}
            renderButtonGroup={(props: any) => (
              <Button
                {...props}
                mr={3}
                onClick={onClose}
                variant='outline'
                size='md'
              >
                Close
              </Button>
            )}
            {...props}
          />
        )}
      </AdvancedSearchModal>
    </>
  );
};
