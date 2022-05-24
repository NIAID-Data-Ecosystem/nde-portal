import React, { useEffect, useState } from 'react';

// Read more about this here: https://www.joshwcomeau.com/react/the-perils-of-rehydration/
export function useHasMounted() {
  const [isMounted, setIsMounted] = useState(false);

  // component has mounted to page.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
