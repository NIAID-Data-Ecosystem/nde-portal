import { Collapse, FlexProps, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

/*
 [COMPONENT INFO]: Disclaimer for large dataset downloads when a certain about of [timeDelay] has passed.
*/

interface DisclaimerProps extends FlexProps {
  isFetching: boolean;
  timeDelay?: number;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({
  isFetching,
  timeDelay = 5000,
}) => {
  // Disclaimer for downloading large sets of metadata.
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // Hide the disclaimer when not fetching
    if (!isFetching) {
      setShowDisclaimer(false);
      return;
    }

    // Set a timer to show the note after 5 seconds when fetching
    const timer = setTimeout(() => {
      setShowDisclaimer(true);
    }, timeDelay);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [isFetching, timeDelay]);

  return (
    <Collapse in={isFetching && showDisclaimer}>
      <Text fontSize='xs' fontStyle='italic'>
        Note: Large sets of metadata may take a long time to download.
      </Text>
    </Collapse>
  );
};
