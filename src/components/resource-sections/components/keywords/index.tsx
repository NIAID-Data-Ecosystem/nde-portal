import React, { useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Button } from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';

interface KeywordsProps {
  keywords: string[];
}

export const Keywords: React.FC<KeywordsProps> = ({ keywords }) => {
  const DEFAULT_LIMIT = 20;
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const buttonText =
    limit === keywords.length
      ? 'Show less keywords'
      : `Show all keywords (${formatNumber(keywords.length - limit)} more)`;
  return (
    <>
      <ScrollContainer maxHeight='300px'>
        {keywords &&
          keywords.slice(0, limit).map((keyword, idx) => {
            return (
              <TagWithUrl
                key={idx + keyword}
                colorScheme='primary'
                href={{
                  pathname: '/search',
                  query: {
                    q: `keywords:"${keyword.trim().toLowerCase()}"`,
                  },
                }}
                m={0.5}
                leftIcon={FaMagnifyingGlass}
              >
                {keyword}
              </TagWithUrl>
            );
          })}
        {keywords && keywords?.length > DEFAULT_LIMIT && (
          <Button
            size='xs'
            variant='link'
            justifyContent='flex-end'
            m={1}
            onClick={() => {
              setLimit(prev => {
                if (prev === keywords.length) {
                  return DEFAULT_LIMIT;
                }
                return keywords.length;
              });
            }}
          >
            {buttonText}
          </Button>
        )}
      </ScrollContainer>
    </>
  );
};
