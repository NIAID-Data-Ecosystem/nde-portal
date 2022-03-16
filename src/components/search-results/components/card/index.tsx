import React from 'react';
import {
  Box,
  Text,
  Flex,
  FlexProps,
  Button,
  Icon,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Badge,
  ListItem,
  UnorderedList,
  Stat,
  StatLabel,
  Image,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardProps,
  ToggleContainer,
  Heading,
  Link,
} from 'nde-design-system';
import {
  FaArrowAltCircleRight,
  FaClock,
  FaLockOpen,
  FaLock,
  FaMinus,
  FaPlus,
} from 'react-icons/fa';
import styled from '@emotion/styled';
import {FormattedResource} from 'src/utils/api/types';
import {getRepositoryImage} from 'src/utils/helpers';

interface AccessBadgeProps {
  conditionsOfAccess?: 'restricted' | 'public' | 'controlled';
  children: React.ReactNode;
}

export const AccessBadge = (args: AccessBadgeProps) => {
  let colorScheme;
  let iconType;

  if (args.conditionsOfAccess === 'public') {
    colorScheme = 'success';
    iconType = FaLockOpen;
  }

  if (args.conditionsOfAccess === 'restricted') {
    colorScheme = 'negative';
    iconType = FaLock;
  }

  if (args.conditionsOfAccess === 'controlled') {
    colorScheme = 'warning';
    iconType = FaLock;
  }

  return (
    <Badge colorScheme={colorScheme} {...args}>
      {iconType && <Icon mr={2} as={iconType} />}
      {args.children}
    </Badge>
  );
};

const StyledLabel = styled(Flex)<FlexProps>`
  display: inline-flex;
  line-height: 1.5;
  position: relative;
  z-index: 9;
  &:before {
    content: '';
    background-color: ${(props: any) => props.theme.colors.status.info};
    box-shadow: 0 0 0 5px #fff;
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    transform: skew(-12deg);
    width: 100%;
    z-index: -4;
  }
`;
StyledLabel.defaultProps = {
  mx: 2,
  p: 2,
};

interface StyledBannerProps {
  name?: FormattedResource['type'];
}

const StyledBanner: React.FC<StyledBannerProps> = ({name, children}) => {
  return (
    <Flex flexWrap={'wrap'} p={0} my={1}>
      <Flex
        bg={'status.info_lt'}
        py={0}
        overflow={'hidden'}
        w={['100%', 'unset']}
      >
        {name && (
          <StyledLabel>
            <Text
              fontSize={'xs'}
              color={'white'}
              px={2}
              fontWeight={'semibold'}
            >
              {name.toUpperCase()}
            </Text>
          </StyledLabel>
        )}
      </Flex>
      <Flex
        bg={'status.info_lt'}
        py={1}
        overflow={'hidden'}
        w={['100%', 'unset']}
        flex={['unset', 1]}
        px={4}
      >
        {children}
      </Flex>
    </Flex>
  );
};

interface SearchResultCardProps {
  id?: FormattedResource['id'];
  name?: FormattedResource['name'];
  type?: FormattedResource['type'];
  datePublished?: FormattedResource['datePublished'];
  author?: FormattedResource['author'];
  description?: FormattedResource['description'];
  license?: FormattedResource['license'];
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  measurementTechnique?: FormattedResource['measurementTechnique'];
  variableMeasured?: FormattedResource['variableMeasured'];
  doi?: FormattedResource['doi'];
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
}

const SearchResultCard: React.FC<SearchResultCardProps> = props => {
  const imageURL =
    props?.includedInDataCatalog?.name &&
    getRepositoryImage(props.includedInDataCatalog.name);
  return (
    <Card variant={'colorful'} {...props}>
      <CardHeader>
        <CardTitle>{props.name}</CardTitle>
      </CardHeader>
      <Flex p={0} flexDirection={['column', 'row']}>
        {/* <ToggleContainer
          variant={'border'}
          ariaLabel={'Show all authors.'}
          noOfLines={1}
          justifyContent='start'
          my={0}
          flex={1}
        > */}
        <Flex px={4} py={2}>
          <Heading size={'xs'} color={'text.body'}>
            {props.author?.map(a => {
              return a.name + '; ';
            })}
          </Heading>
        </Flex>
        {/* </ToggleContainer> */}
        {props.conditionsOfAccess && (
          <Box
            d={['inline-flex', 'block']}
            justifyContent={['end']}
            alignContent='center'
            borderY={`1px solid`}
            borderColor={['transparent', 'gray.200']}
            m={1}
          >
            (
            <AccessBadge conditionsOfAccess={props.conditionsOfAccess}>
              Public
            </AccessBadge>
            )
          </Box>
        )}
      </Flex>
      <StyledBanner name={props.type}>
        {props.datePublished && (
          <Flex alignItems={'center'}>
            <Icon as={FaClock} mr={2}></Icon>
            <Text fontSize={'xs'} fontWeight={'semibold'}>
              Published on {props.datePublished}
            </Text>
          </Flex>
        )}
      </StyledBanner>
      {props.description && (
        <CardBody px={0}>
          <ToggleContainer
            ariaLabel={'show more description'}
            noOfLines={[3, 10]}
            borderColor={'transparent'}
            m={1}
          >
            <Box
              w='100%'
              dangerouslySetInnerHTML={{
                __html: props.description,
              }}
            ></Box>
          </ToggleContainer>
        </CardBody>
      )}
      {(props.license ||
        props.measurementTechnique ||
        props.variableMeasured) && (
        <Accordion allowToggle p={0} pt={1}>
          <AccordionItem>
            {({isExpanded}) => (
              <>
                <h2>
                  <AccordionButton
                    px={[6, 8]}
                    bg={isExpanded ? 'blackAlpha.100' : 'white'}
                  >
                    <Box flex='1' textAlign='left'>
                      <Heading fontSize={'h6'} fontWeight={'semibold'}>
                        Details
                      </Heading>
                    </Box>
                    {isExpanded ? (
                      <Icon as={FaMinus} fontSize='12px' />
                    ) : (
                      <Icon as={FaPlus} fontSize='12px' />
                    )}
                  </AccordionButton>
                </h2>
                <AccordionPanel w='100%' px={[6, 8]}>
                  <UnorderedList ml={0}>
                    {props.license && (
                      <ListItem>
                        <Stat my={2}>
                          <StatLabel color={'gray.700'}>License</StatLabel>
                          <Link href={props.license} isExternal>
                            {props.license}
                          </Link>
                        </Stat>
                      </ListItem>
                    )}
                    {props.measurementTechnique && (
                      <ListItem>
                        <Stat my={2}>
                          <StatLabel color={'gray.700'}>
                            Measurement Technique
                          </StatLabel>
                          <Text fontWeight='semibold'>
                            {props.measurementTechnique}
                          </Text>
                        </Stat>
                      </ListItem>
                    )}
                    {props.variableMeasured && (
                      <ListItem>
                        <Stat my={2}>
                          <StatLabel color={'gray.700'}>
                            Variable Measured
                          </StatLabel>
                          <Text fontWeight='semibold'>
                            {props.variableMeasured}
                          </Text>
                        </Stat>
                      </ListItem>
                    )}
                  </UnorderedList>
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        </Accordion>
      )}
      <CardFooter
        justifyContent={'space-between'}
        alignItems={'flex-end'}
        flexWrap='wrap'
      >
        {props.includedInDataCatalog && (
          <Box>
            {imageURL && (
              <Image
                boxSize={20}
                src={imageURL}
                alt={'source repository logo'}
              ></Image>
            )}
            {props.includedInDataCatalog.url && (
              <Button
                href={props.includedInDataCatalog.url}
                isExternal
                variant={'outline'}
                colorScheme={'primary'}
                mt={[2, 2, 4]}
                maxW={200}
                height={'unset'}
                whiteSpace='normal'
              >
                {props.includedInDataCatalog.name || 'Source'}
              </Button>
            )}
          </Box>
        )}
        {props.id && (
          <Button
            href={`/resources/${props.id}`}
            as={'a'}
            variant={'solid'}
            colorScheme={'primary'}
            mt={[2, 2, 4]}
            alignItems={'center'}
            rightIcon={<FaArrowAltCircleRight />}
          >
            See more
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SearchResultCard;
