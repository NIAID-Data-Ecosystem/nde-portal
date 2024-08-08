import Tooltip from 'src/components/tooltip';
import {
  Icon,
  Link,
  TooltipProps as ChakraTooltipProps,
} from '@chakra-ui/react';
import { FaInfo } from 'react-icons/fa6';

interface TooltipProps extends ChakraTooltipProps {
  url: string;
}

const TooltipWithLink: React.FC<TooltipProps> = ({
  label,
  url,
  children,
  ...props
}) => {
  return (
    <Tooltip label={label} {...props}>
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
          as={FaInfo}
          boxSize={3.5}
          border='1px solid'
          borderRadius='full'
          p={0.5}
          ml={1}
          color='gray.800!important'
        />
      </Link>
    </Tooltip>
  );
};

export default TooltipWithLink;
