import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 *
 * @returns Redirects to the updates page.
 * This page is a placeholder for the news page and will redirect to the updates page.
 */
const NewsPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/updates');
  }, [router]);

  return null;
};

export default NewsPage;
