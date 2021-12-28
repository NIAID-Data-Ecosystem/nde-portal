import {Flex} from '@chakra-ui/react';

const PageContainer: React.FC = ({children, ...rest}) => {
  return (
    <Flex as={'main'} bg={'niaid.100'} minH={'80vh'} {...rest}>
      {children}
    </Flex>
  );
};

export default PageContainer;
