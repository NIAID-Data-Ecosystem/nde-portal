import {Box, BoxProps, Text, useStyleConfig} from '@chakra-ui/react';
import {StyledLabel} from './styles';

interface LabelProps extends BoxProps {}

const Label: React.FC<LabelProps> = ({children, ...props}) => {
  return (
    <StyledLabel {...props}>
      <Text color={'nde.text.heading'}>{children}</Text>
    </StyledLabel>
  );
};

export default Label;
