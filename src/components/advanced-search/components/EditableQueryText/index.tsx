import {
  ButtonGroup,
  Editable,
  Flex,
  Icon,
  IconButton,
  Spinner,
  Text,
  useEditableContext,
} from '@chakra-ui/react';
import Tooltip from '../../../tooltip';
import { system } from 'src/theme';
import { useEffect, useState } from 'react';
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
  injectBioSampleScope,
} from '../../utils/query-helpers';
import { removeDuplicateErrors } from '../../utils/validation-checks';
import { TreeItem } from '../SortableWithCombine';
import {
  formatQueryString,
  removeUnnecessaryParentheses,
  validateQueryString,
} from './utils';
import { QueryStringError } from 'src/components/error/types';

interface EditableQueryControlsProps {
  /** Shakes the submit button once after a failed validation attempt. */
  shouldShakeSubmit: boolean;
  /**
   * Validates the current query string and, when it is valid, writes it back to
   * the query builder. Returns whether the edit may be committed — `false`
   * leaves the user in the textarea with their query intact.
   */
  onSubmit: () => boolean;
}

/**
 * Edit / cancel / submit controls for the editable query string.
 *
 * Declared at module scope rather than inside `EditableQueryText` so React
 * keeps the same component type between renders — an inline definition is a new
 * type on every render, which remounts these buttons and drops focus.
 */
const EditableQueryControls = ({
  shouldShakeSubmit,
  onSubmit,
}: EditableQueryControlsProps) => {
  const { editing } = useEditableContext();

  if (!editing) {
    return (
      <Flex justifyContent='end'>
        <Tooltip content='Click to edit'>
          <Editable.EditTrigger asChild>
            <IconButton
              aria-label='Edit'
              size='sm'
              variant='solid'
              colorPalette='gray'
              color='text.body'
            >
              <Icon boxSize={4}>
                <FaRegPenToSquare />
              </Icon>
            </IconButton>
          </Editable.EditTrigger>
        </Tooltip>
      </Flex>
    );
  }

  return (
    <ButtonGroup justifyContent='end' size='sm' w='full' gap={2} mt={2}>
      <Editable.CancelTrigger asChild>
        <IconButton
          aria-label='Cancel'
          variant='solid'
          colorPalette='gray'
          color='text.body'
        >
          <Icon boxSize={6}>
            <FaXmark />
          </Icon>
        </IconButton>
      </Editable.CancelTrigger>
      {/* Must be a real SubmitTrigger, not a plain button with an onClick: zag
      excludes only the submit and cancel triggers from its interact-outside
      watcher, so any other button would register as a click outside the input
      and cancel the edit before the handler could run.

      `onClick` belongs on the trigger rather than the IconButton — zag merges
      the consumer's handler ahead of its own and bails on a default-prevented
      event, which is what lets validation veto the commit. */}
      <Editable.SubmitTrigger
        asChild
        onClick={event => {
          if (!onSubmit()) event.preventDefault();
        }}
      >
        <IconButton
          aria-label='Accept Edit.'
          animation={shouldShakeSubmit ? 'shake 0.2s ease-in-out' : undefined}
        >
          <Icon>
            <FaCheck />
          </Icon>
        </IconButton>
      </Editable.SubmitTrigger>
    </ButtonGroup>
  );
};

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

  // Value of the editable text area. Editable.Root is fully controlled off this
  // state via `value` / `onValueChange`.
  const [value, setValue] = useState(() => defaultValue);

  // Animation for button when error.
  const [animateError, setAnimateError] = useState(false);

  // expected count for query.
  const [debouncedQueryString] = useDebounceValue(value, 1000);

  // Rewrite any @type:Sample token to (@type:Sample AND additionalType:"BioSample")
  // so the count reflects only BioSample records, matching the scoping applied
  // by the search results page.
  const scopedQueryString = injectBioSampleScope(debouncedQueryString);

  const { isLoading, error, data, refetch } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    // Don't refresh everytime window is touched.
    {
      queryKey: [
        'search-results',
        {
          queryString: scopedQueryString,
        },
      ],
      queryFn: ({ signal }) => {
        if (typeof debouncedQueryString !== 'string' && !debouncedQueryString) {
          return;
        }

        // Validate the original (unscoped) query string. The injected
        // additionalType constraint must not be fed into the validation logic,
        // which parses the string back into a query object.
        const formattedQueryString = formatQueryString(debouncedQueryString);
        const validation = validateQueryString(formattedQueryString);
        if (!validation.isValid) {
          return;
        }

        // Fetch with the scoped string so the count is correctly limited to
        // BioSample records when @type:Sample appears in the query.
        // Forward the AbortSignal so the in-flight request is cancelled when
        // the component unmounts (e.g., after the user clicks Submit and the
        // router navigates to /search). Without this, the pending fetch
        // continues to compete for browser connections with the requests the
        // search results page fires on mount, causing the navigation to feel
        // slow.
        return fetchSearchResults(
          {
            q: scopedQueryString,
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

  // Reset the shake once it has played, rather than queueing a fresh timeout on
  // every render.
  useEffect(() => {
    if (!animateError) return;
    const timeout = setTimeout(() => setAnimateError(false), 1000);
    return () => clearTimeout(timeout);
  }, [animateError]);

  useEffect(() => {
    setValue(queryObj.length ? convertObject2QueryString(queryObj) : '');
    setErrors([]);
  }, [queryObj, setErrors]);

  const handleValidation = (str: string) => {
    return validateQueryString(str);
  };

  // Errors of only type "error".
  const hasErrors = errors.filter(err => err.type === 'error').length > 0;

  /** @returns whether the edit may be committed. */
  const handleSubmit = () => {
    const validation = handleValidation(value);

    if (!validation.isValid) {
      const errors = [...validation.errors];

      setErrors(prev => {
        return removeDuplicateErrors([...prev, ...errors]);
      });
      setAnimateError(true);

      return false;
    }

    if (error) {
      const errorMessage = getQueryStatusError(
        error as unknown as { status: string },
      );
      if (errorMessage) {
        setErrors(prev => removeDuplicateErrors([...prev, errorMessage]));
      }
      return false;
    }

    refetch();
    const queryObject = convertQueryString2Object(
      removeUnnecessaryParentheses(validation.querystring),
    );
    updateQueryObj(queryObject);
    return true;
  };

  return (
    <Editable.Root
      display='block'
      border='2px solid'
      borderColor='gray.100'
      borderRadius='semi'
      value={value}
      placeholder='Click to write query string.'
      invalid={hasErrors}
      // `translations.edit` labels the focusable preview, which would otherwise
      // announce as just "edit". The button labels below win over these.
      translations={{
        edit: 'Edit query string',
        submit: 'Submit query string',
        cancel: 'Cancel edit',
        input: 'Edit query input',
      }}
      onValueRevert={() => {
        setValue(defaultValue);
      }}
      onValueChange={({ value: nextValue }) => {
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
      // The submit button is the only way to commit, so validation always runs
      // before the query object is rewritten.
      submitMode='none'
    >
      <Tooltip content='Click to edit'>
        <Editable.Preview
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
      <Editable.Textarea
        aria-label='Edit query input'
        py={2}
        px={4}
        fontSize='sm'
        _focus={{
          boxShadow: hasErrors
            ? `0 0 0 1px ${system.token('colors.error')}`
            : '0 0 0 1px #3182ce',
          borderColor: hasErrors ? system.token('colors.error') : '#3182ce',
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
                  css={{ '--spinner-track-color': 'colors.gray.200' }}
                  borderWidth='2px'
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
        <EditableQueryControls
          shouldShakeSubmit={animateError}
          onSubmit={handleSubmit}
        />
      </Flex>
    </Editable.Root>
  );
};
