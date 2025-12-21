import {
  Box,
  Button,
  Flex,
  FlexProps,
  Icon,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';

interface SidebarContainerProps extends FlexProps {
  children: React.ReactNode;
}

export const SidebarContainer = ({
  children,
  bg,
  ...props
}: SidebarContainerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  return (
    <>
      {!isOpen && (
        <Button
          aria-label='Expand documentation navigation menu'
          onClick={onOpen}
          colorScheme='gray'
          bg={bg || 'white'}
          variant='ghost'
          borderRight='1px solid'
          borderColor='gray.200'
          borderRadius='none'
          px={4}
          display='flex'
          alignItems='flex-start'
        >
          <Icon as={FaAnglesRight} position='sticky' top={4}></Icon>
        </Button>
      )}
      <Box
        className='content'
        bg={bg || 'white'}
        borderRight='1px solid'
        borderColor='gray.100'
        w={isOpen ? '350px' : '0px'}
        transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
        maxW='400px'
        transitionDuration='fast'
        transitionProperty='width, transform'
        transitionTimingFunction='ease'
        {...props}
      >
        <Box position='sticky' top='0px' w='100%' h='100vh'>
          <Flex
            h='100%'
            flexDirection='column'
            overflow={isOpen ? 'visible' : 'hidden'}
          >
            <Button
              aria-label='Collapse documentation navigation menu'
              onClick={onClose}
              colorScheme='gray'
              variant='ghost'
              borderRadius='none'
              display='flex'
              alignItems='center'
              gap={2}
            >
              <Icon as={FaAnglesLeft}></Icon>
              <Text fontSize='sm' fontWeight='semibold'>
                Hide Menu
              </Text>
            </Button>
            <ScrollContainer
              as='aside'
              overflowX='hidden'
              overflowY='auto'
              h='100%'
              borderY='1px solid'
              borderColor='gray.200'
              pb={4}
              pr={3}
            >
              {children}
            </ScrollContainer>
          </Flex>
        </Box>
      </Box>
    </>
  );
};
