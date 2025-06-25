import { Heading, HeadingProps } from '@chakra-ui/react';

/*
[COMPONENT INFO]:
Heading with slug used to link to a specific section of the page.
*/

export const HeadingWithLinkStyles = {
  span: {
    color: 'status.info',
    cursor: 'pointer',
    fontWeight: 'extrabold',
    mx: 1,
    opacity: 0,
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
  if (!props.slug) {
    return <Heading {...props} />;
  }
  return (
    <a href={'#' + props.slug}>
      <Heading
        sx={HeadingWithLinkStyles}
        scrollMarginTop='1rem'
        display='inline-block!important'
        {...props}
      >
        {props.children}&nbsp;
        <span>#</span>
      </Heading>
    </a>
  );
};
