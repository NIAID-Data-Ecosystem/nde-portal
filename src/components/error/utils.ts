import {
  ErrorType,
  QueryStringError,
} from '../advanced-search/utils/validation-checks';

interface StatusError extends QueryStringError {
  relatedLinks?: {
    label: string;
    href: string;
    isExternal?: boolean;
  }[];
}
export const getQueryStatusError = (error: {
  status: string;
}): StatusError | undefined => {
  if (error) {
    const errorStatus = error.status;

    if (+errorStatus === 400) {
      return {
        id: 'bad-request',
        type: 'error' as ErrorType,
        title: 'Bad Request',
        message: `Check that your query is formatted properly. For more information, see the documentation.`,
        relatedLinks: [
          {
            label: 'Documentation',
            href: 'https://niaid-data.readme.io/docs/advanced-searching',
            isExternal: true,
          },
        ],
      };
    }

    if (+errorStatus === 404) {
      return {
        id: 'not-found',
        type: 'error' as ErrorType,
        title: 'Not Found',
        message:
          'Check that your query is formatted properly. For more information, see the documentation.',
        relatedLinks: [
          {
            label: 'Documentation',
            href: 'https://niaid-data.readme.io/docs/advanced-searching',
            isExternal: true,
          },
        ],
      };
    }
    if (+errorStatus === 500) {
      return {
        id: 'internal-server-error',
        type: 'error' as ErrorType,
        title: 'Internal Server Error',
        message:
          'We are experiencing issues with our servers. Please try again later.',
      };
    }

    if (+errorStatus === 503) {
      return {
        id: 'service-unavailable',
        type: 'error' as ErrorType,
        title: 'Service Unavailable',
        message:
          'We are experiencing issues with your request. If you have many wildcards in your query, try removing them. If issues persist, please try again later.',
        relatedLinks: [
          {
            label: 'Documentation',
            href: 'https://niaid-data.readme.io/docs/advanced-searching',
            isExternal: true,
          },
        ],
      };
    }
    if (+errorStatus === 504) {
      return {
        id: 'gateway-timeout',
        type: 'error' as ErrorType,
        title: 'Gateway Timeout',
        message:
          'We are experiencing issues with your request. If you have many wildcards in your query, try removing them. If issues persist, please try again later.',
        relatedLinks: [
          {
            label: 'Documentation',
            href: 'https://niaid-data.readme.io/docs/advanced-searching',
            isExternal: true,
          },
        ],
      };
    }
  }
};