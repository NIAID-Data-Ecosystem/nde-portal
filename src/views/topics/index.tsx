import { Flex } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { IntroSection } from 'src/views/topics/layouts/intro';
import { SectionWrapper } from 'src/views/topics/layouts/section';
import { TopicPageProps } from 'src/views/topics/types';

export const IndexListView = ({ data }: { data: TopicPageProps[] }) => {
  const pagesGroupedByType = (data || []).reduce((acc, page) => {
    const category = page.attributes.type?.data[0]?.attributes.name || '';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(page);
    return acc;
  }, {} as Record<string, TopicPageProps[]>);

  return (
    <Flex flexDirection='column'>
      <IntroSection title='Topics' />
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
              .map((page: TopicPageProps) => {
                const { title, slug } = page.attributes;
                return (
                  <Link key={slug[0]} href={`/topics/${slug}`}>
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
