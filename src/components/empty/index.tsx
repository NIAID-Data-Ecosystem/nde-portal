import {
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Icon,
  IconProps,
} from '@chakra-ui/react';
import React from 'react';

import { EmptyGlyph } from './components/empty-glyph';

interface EmptyProps extends FlexProps {
  icon?: string;
  message?: string;
  iconProps?: IconProps;
  headingProps?: HeadingProps;
}

// Empty state display component.
const Empty: React.FC<EmptyProps> = ({
  children,
  icon = 'empty',
  message,
  iconProps,
  headingProps,
  ...rest
}) => {
  return (
    <Flex
      w='100%'
      h='100%'
      alignItems='center'
      justifyContent='center'
      {...rest}
    >
      <Flex direction='column' alignItems='center'>
        {icon && (
          // EmptyGlyph renders bare <title>/<path> elements, so Icon must render
          // its own <svg> instead of defaulting to asChild.
          <Icon
            asChild={false}
            viewBox='0 0 200 200'
            boxSize={100}
            fill='currentColor'
            aria-labelledby='empty'
            role='img'
            {...iconProps}
          >
            <EmptyGlyph id='empty' stroke='currentColor' />
          </Icon>
        )}

        <Heading
          as='h2'
          fontFamily='body'
          mt={4}
          color='inherit'
          {...headingProps}
        >
          {message}
        </Heading>
        {children}
      </Flex>
    </Flex>
  );
};

export default Empty;
