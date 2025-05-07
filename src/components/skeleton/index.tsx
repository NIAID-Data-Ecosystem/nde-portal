import {
  Box,
  SkeletonProps as ChakraSkeletonProps,
  cssVar,
  usePrevious,
  useToken,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

/**
 * `Skeleton` is used to display the loading state of some component.
 * Based on chakra-ui Skeleton source but with improved LCP for our use case.
 * Uses display: none instead of opacity to improve LCP.
 * Relevant issue: @see  https://github.com/chakra-ui/chakra-ui/issues/8022
 * See also: @see https://www.debugbear.com/blog/opacity-animation-poor-lcp
 * Relevant chakra ui component source codr: @see https://github.com/chakra-ui/chakra-ui/blob/bd3d0fd2f444be2ba23764d7c86906cb488fb409/packages/components/skeleton/src/skeleton.tsx
 */
export interface SkeletonProps extends ChakraSkeletonProps {
  isLoaded: boolean;
}

const fade = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const Skeleton = ({
  isLoaded,
  children,
  fadeDuration = 0.4,
  speed = 0.8,
  startColor = 'gray.100',
  endColor = 'gray.400',
  ...rest
}: SkeletonProps) => {
  const wasPreviouslyLoaded = usePrevious(isLoaded);
  const $startColor = cssVar('skeleton-start-color');
  const $endColor = cssVar('skeleton-end-color');
  const [startColorVar, endColorVar] = useToken('colors', [
    startColor,
    endColor,
  ]);
  const cssVarStyles = {
    ...(startColorVar && { [$startColor.variable]: startColorVar }),
    ...(endColorVar && { [$endColor.variable]: endColorVar }),
  };

  const bgFade = keyframes({
    from: {
      borderColor: $startColor.reference,
      background: $startColor.reference,
    },
    to: {
      borderColor: $endColor.reference,
      background: $endColor.reference,
    },
  });
  if (isLoaded) {
    const animation = wasPreviouslyLoaded ? 'none' : `${fade} ${fadeDuration}s`;

    return (
      <Box
        className='custom-skeleton-loaded'
        __css={{ animation, ...rest?.__css }}
        {...rest}
      >
        {children}
      </Box>
    );
  }
  return (
    <Box
      className='custom-skeleton-loading'
      w='100%'
      __css={{
        ...cssVarStyles,
        cursor: 'default',
        position: 'relative',
        pointerEvents: 'none',
        userSelect: 'none',
        _after: {
          content: "''",
          animation: `${speed}s linear infinite alternate ${bgFade}`,
          width: 'full',
          height: 'full',
          position: 'absolute',
          top: 0,
          left: 0,
        },
        ...rest?.__css,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};
