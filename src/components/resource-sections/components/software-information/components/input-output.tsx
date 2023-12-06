import React from 'react';
import { Box, Flex, Icon, Text, TextProps } from 'nde-design-system';
import { InputProperties, OutputProperties } from 'src/utils/api/types';
import { IconType } from 'react-icons';

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

interface StyledText extends TextProps {
  title?: string;
}
const StyledText = ({ title, children, ...props }: StyledText) => {
  return (
    <Text fontSize='sm' lineHeight='short' wordBreak='break-all' {...props}>
      {title && (
        <Text as='span' fontSize='xs' fontWeight='semibold' color='gray.700'>
          {title}
        </Text>
      )}{' '}
      {children || '-'}
    </Text>
  );
};

export default InputOutput;
