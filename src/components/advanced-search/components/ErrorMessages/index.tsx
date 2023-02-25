import {
  Box,
  Collapse,
  Flex,
  Heading,
  ListIcon,
  ListItem,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';
import { QueryStringError } from '../../utils/validation-checks';

interface EditableQueryTextProps {
  errors: QueryStringError[];
  setErrors: React.Dispatch<React.SetStateAction<QueryStringError[]>>;
}
export const ErrorMessages = ({
  errors: allErrors,
}: EditableQueryTextProps) => {
  const warnings = allErrors.filter(error => error.type === 'warning');
  const errors = allErrors.filter(error => error.type === 'error');
  return (
    <Collapse in={!!allErrors.length}>
      {errors.length > 0 && (
        <Flex
          bg='status.error_lt'
          borderLeft='5px solid'
          borderLeftColor='status.error'
          p={2}
          my={2}
        >
          <Box>
            <Flex mx={4} alignItems='center'>
              <Heading as='h5' size='sm' color='status.error'>
                Errors
              </Heading>
            </Flex>
            <UnorderedList py={1}>
              {errors.map((error, index) => {
                return (
                  <ListItem key={index} display='flex' p={1}>
                    <ListIcon
                      as={FaTimesCircle}
                      color='status.error'
                    ></ListIcon>
                    <Box>
                      {error.title && (
                        <Heading
                          as='h6'
                          fontSize='sm'
                          fontWeight='medium'
                          color='text.heading'
                        >
                          {error.title}
                        </Heading>
                      )}
                      <Text fontSize='sm'>{error.message}</Text>
                    </Box>
                  </ListItem>
                );
              })}
            </UnorderedList>
          </Box>
        </Flex>
      )}

      {warnings.length > 0 && (
        <Flex
          bg='status.warning_lt'
          borderLeft='5px solid'
          borderLeftColor='status.warning'
          p={2}
          my={2}
        >
          <Box>
            <Flex mx={4} alignItems='center'>
              <Heading as='h5' size='sm' color='status.warning'>
                Warning
              </Heading>
            </Flex>
            <UnorderedList py={1}>
              {warnings.map((warning, index) => {
                return (
                  <ListItem key={index} display='flex' p={1}>
                    <ListIcon
                      as={FaExclamationCircle}
                      color='status.warning'
                    ></ListIcon>
                    <Box>
                      {warning.title && (
                        <Heading
                          as='h6'
                          fontSize='sm'
                          fontWeight='medium'
                          color='text.heading'
                        >
                          {warning.title}
                        </Heading>
                      )}
                      <Text fontSize='sm'>{warning.message}</Text>
                    </Box>
                  </ListItem>
                );
              })}
            </UnorderedList>
          </Box>
        </Flex>
      )}
    </Collapse>
  );
};
