import {
  Box,
  Collapse,
  Flex,
  Heading,
  Icon,
  IconProps,
  ListIcon,
  ListItem,
  Text,
  UnorderedList,
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
    return <Icon as={FaCircleXmark} color={`status.${status}`} {...props} />;
  } else if (status === 'warning') {
    return (
      <Icon as={FaCircleExclamation} color={`status.${status}`} {...props} />
    );
  } else if (status === 'info') {
    return <Icon as={FaCircleInfo} color={`status.${status}`} {...props} />;
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
        <UnorderedList py={1}>
          {statusItems.map((statusItem, index) => {
            return (
              <ListItem key={index} display='flex' p={1}>
                <ListIcon
                  as={FaCircleXmark}
                  color={`status.${status}`}
                ></ListIcon>
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
              </ListItem>
            );
          })}
        </UnorderedList>
      </Box>
    </Flex>
  );
};

export const ErrorBanner = ({ errors: allErrors }: EditableQueryTextProps) => {
  const warnings = allErrors.filter(error => error.type === 'warning');
  const errors = allErrors.filter(error => error.type === 'error');
  return (
    <Collapse in={!!allErrors.length}>
      {errors.length > 0 && (
        <MessageBlock status='error' statusItems={errors} />
      )}

      {/* only display warning if no errors */}
      {!errors.length && warnings.length > 0 && (
        <MessageBlock status='warning' statusItems={warnings} />
      )}
    </Collapse>
  );
};
