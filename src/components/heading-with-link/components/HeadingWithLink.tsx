import { Heading, HeadingProps } from '@chakra-ui/react';

/*
[COMPONENT INFO]:
Heading with slug used to link to a specific section of the page.
*/

export const HeadingWithLinkStyles = {
  '& > .hyperlink': {
    color: 'info.default',
    cursor: 'pointer',
    fontWeight: 'extrabold',
    lineHeight: 'inherit',
    mx: 1,
    opacity: 0,
    transition: 'opacity 0.1s ease-in-out',
  },
  _hover: {
    '& > .hyperlink': {
      opacity: 1,
      textDecoration: 'underline',
      transition: 'opacity 0.1s ease-in-out',
    },
  },
};

interface HeadingWithLinkProps extends HeadingProps {
  slug: string;
}

export const HeadingWithLink = ({
  children,
  slug,
  ...rest
}: HeadingWithLinkProps) => {
  if (!slug) {
    return <Heading {...rest} />;
  }
  return (
    <a href={'#' + slug}>
      <Heading
        css={HeadingWithLinkStyles}
        scrollMarginTop='1rem'
        display='inline-block!important'
        {...rest}
      >
        {children}&nbsp;
        <span className='hyperlink'>#</span>
      </Heading>
    </a>
  );
};
