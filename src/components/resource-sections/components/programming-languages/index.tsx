import React, { useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Button } from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';

interface ProgrammingLanguagesProps {
  programmingLanguage: string[];
}

export const ProgrammingLanguages: React.FC<ProgrammingLanguagesProps> = ({
  programmingLanguage,
}) => {
  const DEFAULT_LIMIT = 20;
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const buttonText =
    limit === programmingLanguage.length
      ? 'Show fewer languages'
      : `Show all languages (${formatNumber(
          programmingLanguage.length - limit,
        )} more)`;
  return (
    <>
      <ScrollContainer maxHeight='300px'>
        {programmingLanguage &&
          programmingLanguage.slice(0, limit).map((language, idx) => {
            return (
              <TagWithUrl
                key={idx + language}
                colorScheme='primary'
                href={{
                  pathname: '/search',
                  query: {
                    q: `programmingLanguage:"${language.trim().toLowerCase()}"`,
                  },
                }}
                m={0.5}
                leftIcon={FaMagnifyingGlass}
              >
                {language}
              </TagWithUrl>
            );
          })}
        {programmingLanguage && programmingLanguage?.length > DEFAULT_LIMIT && (
          <Button
            size='xs'
            variant='link'
            justifyContent='flex-end'
            m={1}
            onClick={() => {
              setLimit(prev => {
                if (prev === programmingLanguage.length) {
                  return DEFAULT_LIMIT;
                }
                return programmingLanguage.length;
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
