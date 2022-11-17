import React from 'react';
import { Box, Flex, Icon } from 'nde-design-system';
import { InputProperties, OutputProperties } from 'src/utils/api/types';
import { IconType } from 'react-icons';
import { StyledText } from '../../based-on';

interface InputOutputProps extends InputProperties, OutputProperties {
  icon: IconType;
}

const InputOutput: React.FC<InputOutputProps> = ({
  icon,
  name,
  description,
  encodingFormat,
}) => {
  return (
    <Flex>
      <Icon as={icon} color='primary.400' m={1} ml={0} />
      <Box>
        {name && <StyledText>{name}</StyledText>}
        {description && <StyledText>{description}</StyledText>}
        {encodingFormat && (
          <StyledText
            title='Encoding Format:'
            display='flex'
            alignItems='center'
          >
            {encodingFormat}
          </StyledText>
        )}
      </Box>
    </Flex>
  );
};

export default InputOutput;
