import React from 'react';
import { ButtonProps, Icon, Tag, Text } from '@chakra-ui/react';
import { FaSquareArrowUpRight } from 'react-icons/fa6';
import { Link } from 'src/components/link';

interface TagWithUrlProps extends ButtonProps {
  colorScheme?: string;
  url?: string;
  value?: string;
  label?: string;
}

// StyledTag: Memoized component for displaying tags with certain styling
const StyledTag = React.memo(
  ({ children, colorScheme, ...props }: ButtonProps) => {
    return (
      <Tag
        size='sm'
        variant='subtle'
        colorScheme={colorScheme}
        alignItems='center'
        fontSize='12px'
        {...props}
      >
        {children}
      </Tag>
    );
  },
);

// TagWithUrl: Memoized component for displaying tags with optional URLs
export const TagWithUrl = React.memo(
  ({ children, colorScheme, label, url, ...props }: TagWithUrlProps) => {
    return (
      <StyledTag colorScheme={colorScheme} {...props}>
        {label && (
          <Text
            as='span'
            mr={1}
            fontWeight='bold'
            lineHeight='short'
            fontSize='inherit'
          >
            {label}
          </Text>
        )}
        {url ? (
          <Link
            href={url}
            target='_blank'
            alignItems='center'
            color={colorScheme ? `${colorScheme}.600` : 'link.color'}
            _hover={{
              color: colorScheme ? `${colorScheme}.600` : 'link.color',
            }}
          >
            <Text color='inherit'>{children}</Text>
            <Icon
              as={FaSquareArrowUpRight}
              boxSize={3}
              ml={1}
              color={'inherit'}
            />
          </Link>
        ) : (
          <>{children}</>
        )}
      </StyledTag>
    );
  },
);
