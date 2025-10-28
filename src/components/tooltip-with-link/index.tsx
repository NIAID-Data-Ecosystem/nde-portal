import { Icon, Link, LinkProps } from '@chakra-ui/react';
import { FaInfo } from 'react-icons/fa6';
import { Tooltip, TooltipProps } from 'src/components/tooltip';
import { system } from 'src/theme';

interface TooltipWithLinkProps extends TooltipProps {
  url: string;
  linkProps?: LinkProps;
  variant?: 'light' | 'dark';
}

const theme = {
  dark: {
    '--tooltip-bg':
      system.tokens.getByName('colors.text.heading')?.value || '#2f2f2f',
    color: 'white',
    border: 'none',
    borderColor: 'transparent',
  },
  light: {
    '--tooltip-bg': 'white',
    color: system.tokens.getByName('colors.text.body')?.value || '#404B56',
    border: '1px solid',
    borderColor: system.tokens.getByName('colors.gray.200')?.value || '#E2E8F0',
    '& > [data-part="arrow"] > [data-part="arrow-tip"]': {
      borderColor:
        system.tokens.getByName('colors.gray.200')?.value || '#E2E8F0',
    },
  },
};
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
      contentProps={{
        css: { lineHeight: 'short', fontWeight: 'normal', ...theme[variant] },
      }}
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
