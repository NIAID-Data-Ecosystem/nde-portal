import { Flex, FlexProps } from 'nde-design-system';

export const PageContent: React.FC<FlexProps> = ({ children, ...props }) => {
  return (
    <Flex
      bg={props.bg || 'page.alt'}
      minH='80vh'
      px={{ base: 4, sm: 6, lg: 10, xl: '5vw' }}
      py={{ base: '4', sm: '6', xl: '8' }}
      {...props}
    >
      {children}
    </Flex>
  );
};
