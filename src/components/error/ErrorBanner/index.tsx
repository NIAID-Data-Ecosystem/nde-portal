import {
  Box,
  Collapsible,
  Flex,
  Heading,
  Icon,
  IconProps,
  Text,
  List,
} from '@chakra-ui/react';
import {
  FaCircleExclamation,
  FaCircleInfo,
  FaCircleXmark,
} from 'react-icons/fa6';
import { QueryStringError } from 'src/components/error/types';

interface EditableQueryTextProps {
  errors: QueryStringError[];
  setErrors: React.Dispatch<React.SetStateAction<QueryStringError[]>>;
}

type ErrorType = 'error' | 'warning' | 'info';

export const StatusIcon = ({
  status,
  props,
}: {
  status: ErrorType;
  props: IconProps;
}) => {
  if (status === 'error') {
    return (
      <Icon color={`status.${status}`} {...props} asChild>
        <FaCircleXmark />
      </Icon>
    );
  } else if (status === 'warning') {
    return (
      <Icon color={`status.${status}`} {...props} asChild>
        <FaCircleExclamation />
      </Icon>
    );
  } else if (status === 'info') {
    return (
      <Icon color={`status.${status}`} {...props} asChild>
        <FaCircleInfo />
      </Icon>
    );
  }
  return <></>;
};

export const MessageBlock = ({
  status,
  statusItems,
}: {
  statusItems: QueryStringError[];
  status: ErrorType;
}) => {
  const heading =
    status === 'error'
      ? 'Errors'
      : status === 'info'
      ? 'Information'
      : 'Warnings';

  return (
    <Flex
      bg={`status.${status}_lt`}
      borderLeft='5px solid'
      borderLeftColor={`status.${status}`}
      p={2}
      my={2}
    >
      <Box>
        <Flex mx={4} alignItems='center'>
          <Heading as='h5' size='sm' color={`status.${status}`}>
            {heading}
          </Heading>
        </Flex>
        <List.Root as='ul' py={1}>
          {statusItems.map((statusItem, index) => {
            return (
              <List.Item key={index} display='flex' p={1}>
                <List.Indicator color={`status.${status}`} asChild>
                  <FaCircleXmark />
                </List.Indicator>
                <Box>
                  {statusItem.title && (
                    <Heading
                      as='h6'
                      fontSize='sm'
                      fontWeight='medium'
                      color='text.heading'
                    >
                      {statusItem.title}
                    </Heading>
                  )}
                  <Text fontSize='sm'>{statusItem.message}</Text>
                </Box>
              </List.Item>
            );
          })}
        </List.Root>
      </Box>
    </Flex>
  );
};

export const ErrorBanner = ({ errors: allErrors }: EditableQueryTextProps) => {
  const warnings = allErrors.filter(error => error.type === 'warning');
  const errors = allErrors.filter(error => error.type === 'error');
  return (
    <Collapsible.Root open={!!allErrors.length}>
      <Collapsible.Content>
        {errors.length > 0 && (
          <MessageBlock status='error' statusItems={errors} />
        )}
        {/* only display warning if no errors */}
        {!errors.length && warnings.length > 0 && (
          <MessageBlock status='warning' statusItems={warnings} />
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
