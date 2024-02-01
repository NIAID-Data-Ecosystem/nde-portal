import React, { useEffect } from 'react';
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  Text,
  useDisclosure,
  useBreakpointValue,
  Icon,
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';

/*
[COMPONENT INFO]:
Styled responsive container for filters.
*/

interface FiltersContainerProps {
  // title to show on top of container
  title?: string;
  children: React.ReactNode;
}

export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  title,
  children,
}) => {
  // Handle toggle open status of mobile filter
  const btnRef = React.useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const screenSize = useBreakpointValue({
    base: 'mobile',
    sm: 'tablet',
    md: 'desktop',
  });

  // Fixes issue with showing footer button on iOS: https://github.com/chakra-ui/chakra-ui/issues/2468
  const [innerHeight, setH] = React.useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 100,
  );

  function windowResizeHandler() {
    if (window !== undefined) {
      setH(window.innerHeight);
    }
  }

  useEffect(() => {
    if (window !== undefined) {
      window.addEventListener('resize', windowResizeHandler);
      return () => {
        window.removeEventListener('resize', windowResizeHandler);
      };
    }
  }, []);

  // return (
  //   <>
  //     {/* Toggle filters on mobile */}
  //     {/* Styles of floating button from niaid design specs: https://designsystem.niaid.nih.gov/components/atoms */}
  //     <Button
  //       display={{ base: 'block', md: 'none' }}
  //       ref={btnRef}
  //       variant='solid'
  //       bg='accent.bg'
  //       onClick={onOpen}
  //       position='fixed'
  //       zIndex='docked'
  //       left={4}
  //       bottom={50}
  //       boxShadow='high'
  //       w='3.5rem'
  //       h='3.5rem'
  //       p={0}
  //       transition='0.3s ease-in-out !important'
  //       overflow='hidden'
  //       justifyContent='flex-start'
  //       _hover={{
  //         width: '12rem',
  //       }}
  //     >
  //       <Flex
  //         w='3.5rem'
  //         minW='3.5rem'
  //         h='3.5rem'
  //         alignItems='center'
  //         justifyContent='center'
  //       >
  //         <Icon as={FaFilter} boxSize={5} ml={1} mr={2} />
  //       </Flex>
  //       <Text pl={2} color='white' fontWeight='semibold' fontSize='lg'>
  //         {title || 'Filters'}
  //       </Text>
  //     </Button>
  //     {screenSize !== 'desktop' && (
  //       <Drawer
  //         autoFocus={false}
  //         isOpen={isOpen}
  //         placement='left'
  //         onClose={onClose}
  //         finalFocusRef={btnRef}
  //         size={screenSize === 'mobile' ? 'full' : 'md'}
  //       >
  //         <DrawerOverlay />
  //         <DrawerContent height={`${innerHeight}px`}>
  //           <DrawerCloseButton />
  //           <DrawerHeader borderBottomWidth='1px'>Filters</DrawerHeader>
  //           <ScrollContainer>
  //             <DrawerBody>{children}</DrawerBody>
  //           </ScrollContainer>
  //           <DrawerFooter borderTopWidth='1px'>
  //             <Button onClick={onClose} colorScheme='secondary' size='md'>
  //               Submit and Close
  //             </Button>
  //           </DrawerFooter>
  //         </DrawerContent>
  //       </Drawer>
  //     )}

  //     {/* For Desktop */}
  //     <Box
  //       flex={1}
  //       minW='270px'
  //       maxW='400px'
  //       position='sticky'
  //       h='100vh'
  //       top='0px'
  //       boxShadow='base'
  //       background='white'
  //       borderRadius='semi'
  //       overflowY='auto'
  //       display={{ base: 'none', md: 'block' }}
  //     >
  //       <ScrollContainer
  //         flex={1}
  //         minW='270px'
  //         maxW='400px'
  //         position='sticky'
  //         h='100vh'
  //         top='0px'
  //         boxShadow='base'
  //         background='white'
  //         borderRadius='semi'
  //         overflowY='auto'
  //       >
  //         {children}
  //       </ScrollContainer>
  //     </Box>
  //   </>
  // );
  // For mobile view, we show a button that pops out a filters drawer
  return screenSize !== 'desktop' ? (
    <>
      {/* Styles of floating button from niaid design specs: https://designsystem.niaid.nih.gov/components/atoms */}
      <Button
        ref={btnRef}
        variant='solid'
        bg='accent.bg'
        onClick={onOpen}
        position='fixed'
        zIndex='docked'
        left={4}
        bottom={50}
        boxShadow='high'
        w='3.5rem'
        h='3.5rem'
        p={0}
        transition='0.3s ease-in-out !important'
        overflow='hidden'
        justifyContent='flex-start'
        _hover={{
          width: '12rem',
        }}
      >
        <Flex
          w='3.5rem'
          minW='3.5rem'
          h='3.5rem'
          alignItems='center'
          justifyContent='center'
        >
          <Icon as={FaFilter} boxSize={5} ml={1} mr={2} />
        </Flex>
        <Text pl={2} color='white' fontWeight='semibold' fontSize='lg'>
          {title || 'Filters'}
        </Text>
      </Button>
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        finalFocusRef={btnRef}
        size={screenSize === 'mobile' ? 'full' : 'md'}
      >
        <DrawerOverlay />
        <DrawerContent height={`${innerHeight}px`}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>Filters</DrawerHeader>
          <ScrollContainer>
            <DrawerBody>{children}</DrawerBody>
          </ScrollContainer>
          <DrawerFooter borderTopWidth='1px'>
            <Button onClick={onClose} colorScheme='secondary' size='md'>
              Submit and Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  ) : (
    <ScrollContainer
      flex={1}
      minW='270px'
      maxW='400px'
      position='sticky'
      h='100vh'
      top='0px'
      boxShadow='base'
      background='white'
      borderRadius='semi'
      overflowY='auto'
    >
      {children}
    </ScrollContainer>
  );
};
