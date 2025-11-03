import {
  Collapsible,
  CollapsibleRootProps,
  Flex,
  FlexProps,
} from '@chakra-ui/react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

interface ToggleContainerProps extends CollapsibleRootProps {
  children: React.ReactNode;
  flexProps?: FlexProps;
  toggle?: (isOpen: boolean, isOverflowing: boolean) => React.ReactNode;
}

export const ToggleContainer = ({
  children,
  defaultOpen = false,
  flexProps,
  toggle,
  ...props
}: ToggleContainerProps) => {
  const [open, setOpen] = useState(defaultOpen);

  // Detect whether to allow toggle/disable collapsible by checking if container is larger than set height.
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handleOverflow = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, []);

  useLayoutEffect(() => {
    handleOverflow();
    const onResize = () => requestAnimationFrame(handleOverflow);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [handleOverflow]);

  return (
    <Collapsible.Root
      aria-label={`Toggle ${open ? 'Collapse' : 'Expand'}`}
      open={open}
      onClick={() => isOverflowing && setOpen(!open)}
      cursor={isOverflowing ? 'pointer' : 'default'}
      disabled={!isOverflowing}
      _hover={{ bg: isOverflowing ? 'niaid.50' : 'transparent' }}
      collapsedHeight='1.5rem'
      position='relative'
      display='flex'
      alignItems={open ? 'flex-end' : 'center'}
      flex={1}
      {...props}
    >
      <Collapsible.Content ref={containerRef} flex={1}>
        <Flex flex={1} {...flexProps}>
          {children}
        </Flex>
      </Collapsible.Content>

      {isOverflowing &&
        (toggle?.(open, isOverflowing) || (
          <Flex color='page.placeholder' mx={1}>
            {open ? <FaMinus /> : <FaPlus />}
          </Flex>
        ))}
    </Collapsible.Root>
  );
};
