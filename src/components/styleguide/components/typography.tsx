import React from 'react';
import {Box, Flex, Heading, Stack, Text} from '@chakra-ui/react';
import styled from '@emotion/styled';

/**
 * Showcase for different theme fonts.
 */

interface TypographyProps {
  fontFamily: string;
}

const StyledHeading = styled(Heading)(props => ({
  textAlign: 'right',
  isTruncated: true,
}));

const Typography: React.FC<TypographyProps> = ({children, fontFamily}) => {
  return (
    <Flex direction={['column', 'row']}>
      <Box my={4} flex={1}>
        <Text fontSize='xl'>Font Family: {fontFamily}</Text>
        <Heading as='h1' size='h1' fontFamily={fontFamily}>
          Aa
        </Heading>
        <Flex width={['100%', '40%']} my={4}>
          <Heading as='h4' size='h4'>
            Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww
            Xx Yy Zz
          </Heading>
        </Flex>
        <Flex width={['100%', '40%']} my={4}>
          <Heading as='h5' size='h5'>
            {'1234567890!@#$%^&*()_+<>/'}
          </Heading>
        </Flex>

        <Flex width={['100%', '40%']} my={4}>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </Text>
        </Flex>
      </Box>
      <Stack
        spacing={[2, 8]}
        my={[0, 6]}
        mb={[6, 0]}
        direction={['row', 'column']}
        wrap='wrap'
      >
        <StyledHeading as='h1' size='h1' fontFamily={fontFamily}>
          H1
        </StyledHeading>
        <StyledHeading as='h2' size='h2' fontFamily={fontFamily}>
          H2
        </StyledHeading>
        <StyledHeading as='h3' size='h3' fontFamily={fontFamily}>
          H3
        </StyledHeading>
        <StyledHeading as='h4' size='h4' fontFamily={fontFamily}>
          H4
        </StyledHeading>
        <StyledHeading as='h5' size='h5' fontFamily={fontFamily}>
          H5
        </StyledHeading>
        <StyledHeading as='h5' size='h6' fontFamily={fontFamily}>
          H6
        </StyledHeading>
      </Stack>
    </Flex>
  );
};

export default Typography;
