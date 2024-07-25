import {
  ButtonGroup,
  Editable,
  EditablePreview,
  EditableTextarea,
  Flex,
  Icon,
  IconButton,
  keyframes,
  Spinner,
  Text,
  Textarea,
  Tooltip,
  useEditableControls,
  VisuallyHidden,
} from '@chakra-ui/react';
import { theme } from 'src/theme';
import { MouseEventHandler, useEffect, useState } from 'react';
import { FaCheck, FaRegPenToSquare, FaXmark } from 'react-icons/fa6';
import { useQuery } from '@tanstack/react-query';
import { getQueryStatusError } from 'src/components/error/utils';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { formatNumber } from 'src/utils/helpers';
import { useDebounceValue } from 'usehooks-ts';
import {
  convertObject2QueryString,
  convertQueryString2Object,
} from '../../utils/query-helpers';
import { removeDuplicateErrors } from '../../utils/validation-checks';
import { TreeItem } from '../SortableWithCombine';
import {
  formatQueryString,
  removeUnnecessaryParentheses,
  validateQueryString,
} from './utils';
import { QueryStringError } from 'src/components/error/types';

interface EditableQueryTextProps {
  queryObj: TreeItem[];
  updateQueryObj: React.Dispatch<React.SetStateAction<TreeItem[]>>;
  errors: QueryStringError[];
  setErrors: React.Dispatch<React.SetStateAction<QueryStringError[]>>;
}

export const EditableQueryText = ({
  queryObj,
  updateQueryObj,
  errors,
  setErrors,
}: EditableQueryTextProps) => {
  // Convert query object in query builder to string.
  const defaultValue = queryObj.length
    ? convertObject2QueryString(queryObj)
    : '';

  // Value of the editable text area.
  const [value, setValue] = useState(() => defaultValue);

  // Animation for button when error.
  const [animateError, setAnimateError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // expected count for query.
  const [debouncedQueryString] = useDebounceValue(value, 1000);

  const { isLoading, error, data, refetch } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    // Don't refresh everytime window is touched.
    {
      queryKey: [
        'search-results',
        {
          queryString: debouncedQueryString,
        },
      ],
      queryFn: ({ signal }) => {
        if (typeof debouncedQueryString !== 'string' && !debouncedQueryString) {
          return;
        }
        const formattedQueryString = formatQueryString(debouncedQueryString);
        const validation = validateQueryString(formattedQueryString);
        if (!validation.isValid) {
          return;
        }

        return fetchSearchResults(
          {
            q: debouncedQueryString,
            size: 0,
          },
          signal,
        );
      },
      refetchOnWindowFocus: false,
      enabled: !!debouncedQueryString,
      retry: false,
    },
  );

  useEffect(() => {
    // If there are no errors but no results. Show warning.
    if (data?.total === 0) {
      setErrors(prev =>
        removeDuplicateErrors([
          ...prev,
          {
            id: 'no-results',
            type: 'warning',
            title: 'Search generates no results.',
            message:
              'Your search query has no errors but it generates 0 results. Try making it more general.',
          },
        ]),
      );
    }
  }, [data, setErrors]);

  useEffect(() => {
    setTimeout(() => {
      setAnimateError(false);
    }, 1000);
  });

  useEffect(() => {
    setValue(queryObj.length ? convertObject2QueryString(queryObj) : '');
    setErrors([]);
  }, [queryObj, setErrors]);

  const handleValidation = (str: string) => {
    return validateQueryString(str);
  };

  // Errors of only type "error".
  const hasErrors = errors.filter(err => err.type === 'error').length > 0;

  /* Controls for editable text area. */
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    const shakeAnimation = `${shake} 0.2s ease-in-out 0s 1`;

    const handleSubmit:
      | MouseEventHandler<HTMLButtonElement>
      | undefined = e => {
      const validation = handleValidation(value);
      setIsSubmitting(true);
      if (!validation.isValid) {
        const errors = [...validation.errors];

        setErrors(prev => {
          return removeDuplicateErrors([...prev, ...errors]);
        });
        setAnimateError(true);

        return;
      } else if (error) {
        const errorMessage = getQueryStatusError(
          error as unknown as { status: string },
        );
        if (errorMessage) {
          setErrors(prev => removeDuplicateErrors([...prev, errorMessage]));
        }
        setIsSubmitting(false);
      } else {
        refetch();
        const queryObject = convertQueryString2Object(
          removeUnnecessaryParentheses(validation.querystring),
        );
        updateQueryObj(queryObject);
        const submitProps = getSubmitButtonProps && getSubmitButtonProps();
        submitProps.onClick && submitProps.onClick(e);
      }
    };

    return isEditing ? (
      <ButtonGroup justifyContent='end' size='sm' w='full' spacing={2} mt={2}>
        <IconButton
          aria-label='Cancel'
          variant='solid'
          colorScheme='gray'
          color='text.body'
          icon={<Icon as={FaXmark} boxSize={6} />}
          {...getCancelButtonProps()}
        />
        <IconButton
          aria-label='Accept Edit.'
          animation={animateError ? shakeAnimation : undefined}
          icon={<Icon as={FaCheck} />}
          {...getSubmitButtonProps()}
          onClick={handleSubmit}
        />
      </ButtonGroup>
    ) : (
      <Flex justifyContent='end'>
        <Tooltip label='Click to edit'>
          <IconButton
            aria-label='Edit'
            size='sm'
            variant='solid'
            colorScheme='gray'
            color='text.body'
            icon={<Icon as={FaRegPenToSquare} boxSize={4} />}
            {...getEditButtonProps()}
          />
        </Tooltip>
      </Flex>
    );
  }

  return (
    <>
      <Editable
        submitOnBlur={false}
        border='2px solid'
        borderColor='gray.100'
        borderRadius='semi'
        value={value}
        placeholder='Click to write query string.'
        onCancel={() => {
          setValue(defaultValue);
        }}
        onChange={nextValue => {
          setValue(nextValue);
          const validation = handleValidation(nextValue);
          if (validation.errors.length < errors.length) {
            setErrors(() => {
              const newErrs = errors.filter(
                error =>
                  validation.errors.findIndex(
                    item => item.title === error.title,
                  ) > -1,
              );
              return removeDuplicateErrors(newErrs);
            });
          }
        }}
      >
        <Tooltip label='Click to edit'>
          <EditablePreview
            w='100%'
            py={2}
            px={4}
            color={value ? 'text.body' : 'gray.800'}
            fontSize='sm'
            fontStyle='italic'
            _hover={{
              background: 'gray.100',
            }}
          />
        </Tooltip>
        <VisuallyHidden>
          <label id='editable-label'>Edit query input</label>
        </VisuallyHidden>
        <Textarea
          aria-labelledby='editable-label'
          py={2}
          px={4}
          fontSize='sm'
          as={EditableTextarea}
          isInvalid={hasErrors}
          _focus={{
            boxShadow: hasErrors
              ? `0 0 0 1px ${theme.colors.status.error}`
              : '0 0 0 1px #3182ce',
            borderColor: hasErrors ? theme.colors.status.error : '#3182ce',
          }}
        />
        <Flex p={2} justifyContent='space-between' alignItems='center'>
          <Flex>
            {value && (
              <Text
                fontSize='sm'
                fontWeight='light'
                fontStyle='italic'
                whiteSpace='nowrap'
                color='text.body'
              >
                Expected output:{' '}
                {isLoading ? (
                  <Spinner
                    color='primary.500'
                    emptyColor='gray.200'
                    thickness='2px'
                    size='sm'
                    mx={2}
                  />
                ) : (
                  <span>
                    {data?.total ? formatNumber(data.total) : 0} result
                    {data?.total === 1 ? '' : 's'}
                  </span>
                )}
              </Text>
            )}
          </Flex>
          <EditableControls />
        </Flex>
      </Editable>
    </>
  );
};

const shake = keyframes`
0% {
  transform: translateX(0rem);
}
25% {
  transform: translateX(0.25rem);
}
75% {
  transform: translateX(-0.25rem);
}
100% {
  transform: translateX(0rem);
}
`;
