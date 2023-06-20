import { Box, BoxProps, Heading, HeadingProps } from 'nde-design-system';

interface SectionHeadContainerProps extends BoxProps {
  children?: React.ReactNode;
}
export const StyledSectionHeadContainer: React.FC<
  SectionHeadContainerProps
> = ({ children, ...props }) => {
  return (
    <Box bg='page.alt' px={4} py={2} {...props}>
      {children}
    </Box>
  );
};

interface SectionHeadingProps extends HeadingProps {
  children?: React.ReactNode;
}
export const StyledSectionHeading: React.FC<SectionHeadingProps> = ({
  children,
  ...props
}) => {
  return (
    <Heading fontFamily='body' as='h3' size='sm' {...props}>
      {children}
    </Heading>
  );
};
