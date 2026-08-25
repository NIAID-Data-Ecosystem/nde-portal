import { Icon, Link, Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { FaInfo } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';

interface TooltipProps extends ChakraTooltip.RootProps {
  content: React.ReactNode;
  url: string;
  children: React.ReactNode;
}

const TooltipWithLink: React.FC<TooltipProps> = ({
  content,
  url,
  children,
  ...props
}) => {
  return (
    <Tooltip content={content} {...props}>
      <Link
        href={url}
        mt={2}
        textDecoration='underline'
        lineHeight='shorter'
        color='gray.800!important'
        fontSize='xs'
        textAlign='center'
        _hover={{ textDecoration: 'none' }}
      >
        {children}{' '}
        <Icon
          boxSize={3.5}
          border='1px solid'
          borderRadius='full'
          p={0.5}
          ml={1}
          color='gray.800!important'
          asChild
        >
          <FaInfo />
        </Icon>
      </Link>
    </Tooltip>
  );
};

export default TooltipWithLink;
