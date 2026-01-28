import { Button, ButtonProps, useClipboard } from '@chakra-ui/react';
import React from 'react';
import { FaCopy } from 'react-icons/fa6';

/*
 [COMPONENT INFO]: Button that copies resource ID to clipboard.
*/

interface CopyResourceIdProps {
  resourceId: string;
  buttonProps?: ButtonProps;
}

export const CopyResourceId: React.FC<CopyResourceIdProps> = ({
  resourceId,
  buttonProps,
}) => {
  const { onCopy, hasCopied } = useClipboard(resourceId);

  return (
    <Button
      size='sm'
      variant='solid'
      leftIcon={<FaCopy />}
      colorScheme='primary'
      onClick={onCopy}
      {...buttonProps}
    >
      {hasCopied ? 'Resource ID copied!' : 'Copy ID'}
    </Button>
  );
};
