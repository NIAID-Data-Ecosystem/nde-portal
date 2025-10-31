import { Icon, Link, LinkProps } from '@chakra-ui/react';
import { FaInfo } from 'react-icons/fa6';
import { Tooltip, TooltipProps } from 'src/components/tooltip';

interface TooltipWithLinkProps extends TooltipProps {
  url: string;
  linkProps?: LinkProps;
  variant?: 'light' | 'dark';
}

const TooltipWithLink: React.FC<TooltipWithLinkProps> = ({
  content,
  url,
  children,
  linkProps = {},
  variant = 'light',
  ...props
}) => {
  return (
    <Tooltip
      content={content}
      interactive // In this mode, the tooltip will remain open when user hovers over the content.
      variant={variant}
      {...props}
    >
      <Link
        href={url}
        fontSize='xs'
        color='gray.800!important'
        lineHeight='shorter'
      >
        {children}{' '}
        <Icon
          as={FaInfo}
          boxSize={3.5}
          border='1px solid'
          borderRadius='full'
          p={0.5}
          ml={0.5}
          mb={1.5}
          color='gray.800!important'
        />
      </Link>
    </Tooltip>
  );
};

export default TooltipWithLink;
