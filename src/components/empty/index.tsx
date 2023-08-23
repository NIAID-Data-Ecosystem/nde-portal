import React from 'react';
import {
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Icon,
  IconProps,
} from 'nde-design-system';
import Glyph from '../icon/components/glyph';

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
          <Icon
            viewBox='0 0 200 200'
            boxSize={100}
            fill='currentColor'
            aria-labelledby='empty'
            role='img'
            {...iconProps}
          >
            <Glyph
              id='empty'
              glyph='empty'
              stroke='currentColor'
              title='Empty, no data available.'
            />
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
