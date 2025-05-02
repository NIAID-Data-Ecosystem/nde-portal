import { Flex } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { DiseasePageProps } from 'src/views/diseases/types';
import { IntroSection } from '../disease/layouts/intro';
import { SectionWrapper } from '../disease/layouts/section';

export const TableOfContents = ({ data }: { data: DiseasePageProps[] }) => {
  const pagesGroupedByType = (data || []).reduce((acc, page) => {
    const category = page.attributes.type?.data[0]?.attributes.name || '';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(page);
    return acc;
  }, {} as Record<string, DiseasePageProps[]>);

  return (
    <Flex flexDirection='column'>
      <IntroSection title='Diseases' />
      {Object.entries(pagesGroupedByType).map(([sectionTitle, pages]) => {
        const id = sectionTitle.toLowerCase().replace(/\s+/g, '-');
        return (
          <SectionWrapper
            key={sectionTitle}
            as='h3'
            id={id}
            slug={`#${id}`}
            title={sectionTitle}
          >
            {pages
              .sort((a, b) => {
                return a.attributes.title.localeCompare(b.attributes.title);
              })
              .map((page: DiseasePageProps) => {
                const { title, slug } = page.attributes;
                return (
                  <Link key={slug[0]} href={`/diseases/${slug}`}>
                    {title}
                  </Link>
                );
              })}
          </SectionWrapper>
        );
      })}
    </Flex>
  );
};
