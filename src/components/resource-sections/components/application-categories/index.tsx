import React, { useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Button } from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';

interface ApplicationCategoriesProps {
  applicationCategory: string[];
}

export const ApplicationCategories: React.FC<ApplicationCategoriesProps> = ({
  applicationCategory,
}) => {
  const DEFAULT_LIMIT = 20;
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const buttonText =
    limit === applicationCategory.length
      ? 'Show fewer categories'
      : `Show all categories (${formatNumber(
          applicationCategory.length - limit,
        )} more)`;
  return (
    <>
      <ScrollContainer maxHeight='300px'>
        {applicationCategory &&
          applicationCategory.slice(0, limit).map((category, idx) => {
            return (
              <TagWithUrl
                key={idx + category}
                colorScheme='primary'
                href={{
                  pathname: '/search',
                  query: {
                    q: `applicationCategory:"${category.trim().toLowerCase()}"`,
                  },
                }}
                m={0.5}
                leftIcon={FaMagnifyingGlass}
              >
                {category}
              </TagWithUrl>
            );
          })}
        {applicationCategory && applicationCategory?.length > DEFAULT_LIMIT && (
          <Button
            size='xs'
            variant='link'
            justifyContent='flex-end'
            m={1}
            onClick={() => {
              setLimit(prev => {
                if (prev === applicationCategory.length) {
                  return DEFAULT_LIMIT;
                }
                return applicationCategory.length;
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
