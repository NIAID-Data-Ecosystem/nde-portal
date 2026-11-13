import { Separator, Skeleton } from '@chakra-ui/react';
import { DisplayHTMLContent } from 'src/components/html-content';

interface DescriptionSectionProps {
  description?: string | null;
  abstract?: string | null;
  loading: boolean;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  description,
  abstract,
  loading,
}) => {
  if (!description && !abstract) {
    return null;
  }

  return (
    <Skeleton loading={loading} flex='1' lineHeight='tall' w='100%'>
      {(description || abstract) && (
        <>
          {/* Abstract text */}
          {abstract && (
            <>
              <DisplayHTMLContent
                content={`**Abstract:** ${abstract}` || ''}
                overflow='auto'
              />
              <Separator my={2} />
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
