import { Heading, Text, HeadingProps } from '@chakra-ui/react';

/*
[COMPONENT INFO]:
Heading with slug used to link to a specific section of the page.
*/

export const HeadingWithLinkStyles = {
  span: {
    opacity: 0,
    color: 'status.info',
    fontWeight: 'extrabold',
    mx: 2,
    cursor: 'pointer',
    transition: 'opacity 0.1s ease-in-out',
  },
  _hover: {
    span: {
      opacity: 1,
      textDecoration: 'underline',
      transition: 'opacity 0.1s ease-in-out',
    },
  },
};

interface HeadingWithLinkProps extends HeadingProps {
  slug: string;
}

export const HeadingWithLink = (props: HeadingWithLinkProps) => {
  if (props.slug) {
    return (
      <a href={props.slug}>
        <Heading sx={HeadingWithLinkStyles} {...props}>
          {props.children}
          <Text as='span' fontWeight='bold' fontSize='lg'>
            #
          </Text>
        </Heading>
      </a>
    );
  }
  return <Heading {...props} />;
};
