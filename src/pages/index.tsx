import {useState} from 'react';
import type {NextPage} from 'next';
import {
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  SearchInput,
  Text,
} from 'nde-design-system';
import {PageContainer, PageContent} from 'src/components/page-container';
import {useRouter} from 'next/router';
import homepageCopy from 'configs/homepage.json';
import {FaChevronRight} from 'react-icons/fa';
import {keyframes, usePrefersReducedMotion} from '@chakra-ui/react';

const sample_queries = [
  // {title: 'NIAID priorities'},
  {
    title: 'E. coli',
    searchTerms:
      '"E. coli" "Escherichia coli" "Shiga Toxin-Producing E. coli" "STEC"',
  },
  {title: 'Tuberculosis', searchTerms: 'Tuberculosis TB'},
  {title: 'Ebola', searchTerms: 'Ebola EBOV EVD'},
];
interface QuickQueryLinkProps {
  title: string;
  queryString: string;
}
// Text under search bar with quick queries for users to get started with.
const QuickQueryLink: React.FC<QuickQueryLinkProps> = ({
  title,
  queryString,
}) => {
  if (!title || !queryString) {
    return null;
  }
  return (
    <Link
      mx={2}
      href={`/search?q=${queryString}`}
      color='whiteAlpha.800'
      _hover={{
        color: 'white',
        svg: {transform: 'translateX(0)', transition: '0.2s ease-in-out'},
      }}
      _visited={{color: 'white'}}
    >
      <Flex alignItems='center'>
        {title}
        <Icon
          as={FaChevronRight}
          ml={2}
          boxSize={3}
          transform='translateX(-5px)'
          transition='0.2s ease-in-out'
        ></Icon>
      </Flex>
    </Link>
  );
};

const fade = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0px);
  }
`;

const Home: NextPage = () => {
  const router = useRouter();

  // Search term entered in search bar
  const [searchTerm, setSearchTerm] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  // Don't animate based on users preference (uses window.matchMedia).
  const prefersReducedMotion = usePrefersReducedMotion();
  const animation = prefersReducedMotion
    ? undefined
    : `${fade} 1.2s ease-in-out both`;

  return (
    <>
      <PageContainer
        hasNavigation
        title='Search'
        metaDescription='Discovery Portal home page.'
      >
        <PageContent
          bgImg='/assets/home-bg.png'
          backgroundSize='cover'
          flexWrap='wrap'
          minH='unset'
        >
          {/* Header section */}
          <Box id='header' as='section' p={[4, 10]} my={8} w='100%'>
            <Heading
              as='h1'
              size='h1'
              color='white'
              fontWeight='bold'
              letterSpacing={1}
              lineHeight='shorter'
              animation={animation}
            >
              {homepageCopy.sections[0].heading}
            </Heading>
            <Text
              color='white'
              fontSize='xl'
              fontWeight='semibold'
              mt={4}
              animation={animation}
              sx={{animationDelay: '1s'}}
            >
              {homepageCopy.sections[0].subtitle}
            </Text>
            <Text
              color='white'
              fontWeight='light'
              lineHeight={'short'}
              mt={2}
              maxWidth='400px'
              animation={animation}
              sx={{animationDelay: '1.5s'}}
            >
              {homepageCopy.sections[0].body}
            </Text>
            <Flex w='100%' mt={20} justifyContent='center'>
              <Flex flexDirection='column' maxW='600px' w='100%'>
                <SearchInput
                  w='100%'
                  isResponsive={false}
                  colorScheme='primary'
                  ariaLabel='Search for datasets or tools'
                  placeholder='Search for datasets or tools'
                  value={searchTerm}
                  handleChange={handleChange}
                  handleSubmit={e => {
                    e.preventDefault();
                    searchTerm && router.push(`/search?q=${searchTerm}`);
                  }}
                />
                <Flex mt={2}>
                  <Text color='whiteAlpha.800' mr={2}>
                    Try:
                  </Text>
                  {sample_queries.map(query => {
                    return (
                      <QuickQueryLink
                        key={query.title}
                        title={query.title}
                        queryString={query.searchTerms}
                      />
                    );
                  })}
                </Flex>
              </Flex>
            </Flex>
          </Box>
        </PageContent>
      </PageContainer>
    </>
  );
};

export default Home;
