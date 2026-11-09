import { Skeleton, Divider } from '@chakra-ui/react';
import { DisplayHTMLContent } from 'src/components/html-content';

interface DescriptionSectionProps {
  description?: string | null;
  abstract?: string | null;
  isLoading: boolean;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  description,
  abstract,
  isLoading,
}) => {
  if (!description && !abstract) {
    return null;
  }

  return (
    <Skeleton isLoaded={!isLoading} flex='1' lineHeight='tall' w='100%'>
      {(description || abstract) && (
        <>
          {/* Abstract text */}
          {abstract && (
            <>
              <DisplayHTMLContent
                content={`**Abstract:** ${abstract}` || ''}
                overflow='auto'
              />
              <Divider my={2} />
            </>
          )}

          {/* Description text */}
          {description && (
            <DisplayHTMLContent content={description} overflow='auto' />
          )}
        </>
      )}
    </Skeleton>
  );
};
