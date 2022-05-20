import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Divider,
  Flex,
  Heading,
  Icon,
  Image,
  Link,
  ListItem,
  Skeleton,
  Stat,
  StatLabel,
  Text,
  ToggleContainer,
  UnorderedList,
  VisuallyHidden,
  BoxProps,
} from "nde-design-system";
import {
  FaArrowAltCircleRight,
  FaMinus,
  FaPlus,
  FaChevronRight,
} from "react-icons/fa";
import { FormattedResource } from "src/utils/api/types";
import {
  formatAuthorsList2String,
  formatDate,
  formatDOI,
  formatLicense,
  getRepositoryImage,
} from "src/utils/helpers";
import {
  AccessBadge,
  TypeBanner,
} from "src/components/resource-sections/components";
import { assetPrefix } from "next.config";
import NextLink from "next/link";

interface SearchResultCardProps {
  isLoading?: boolean;
  data?: FormattedResource | null;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  isLoading,
  data,
  ...props
}) => {
  const {
    id,
    name,
    type,
    date,
    datePublished,
    author,
    description,
    license,
    conditionsOfAccess,
    measurementTechnique,
    variableMeasured,
    doi,
    includedInDataCatalog,
    url,
  } = data || {};

  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);
  const paddingCard = [4, 6, 8, 10];
  const licenseInfo = license ? formatLicense(license) : null;

  const ConditionsOfAccess = (props: BoxProps) => {
    if (!conditionsOfAccess) {
      return null;
    }
    return (
      <Flex
        justifyContent={["flex-end"]}
        alignItems="center"
        w={["100%", "unset"]}
        flex={[1, "unset"]}
        p={[0.5, 2]}
        {...props}
      >
        <AccessBadge
          w={["100%", "unset"]}
          conditionsOfAccess={conditionsOfAccess}
        >
          {conditionsOfAccess}
        </AccessBadge>
      </Flex>
    );
  };

  return (
    <Card variant="colorful">
      {/* Card header where name of resource is a link to resource apge */}
      <CardHeader position="relative" px={paddingCard} pt={4}>
        <Skeleton
          isLoaded={!isLoading}
          startColor="whiteAlpha.100"
          endColor="whiteAlpha.500"
          h={isLoading ? "20px" : "unset"}
          w="100%"
        >
          {name && (
            <NextLink
              href={{
                pathname: "/resources/",
                query: { id },
              }}
              passHref
            >
              <Link
                h={"100%"}
                flexWrap="nowrap"
                color="white"
                _hover={{
                  color: "white",
                  h2: { textDecoration: "underline" },
                  svg: {
                    transform: "translate(0px)",
                    opacity: 0.9,
                    transition: "0.2s ease-in-out",
                  },
                }}
                _visited={{ color: "white", svg: { color: "white" } }}
              >
                <Flex alignItems="center">
                  <CardTitle size="h6" lineHeight="short" fontWeight="semibold">
                    {name}
                  </CardTitle>
                  <Icon
                    as={FaChevronRight}
                    boxSize={4}
                    ml={4}
                    opacity={0.6}
                    transform="translate(-10px)"
                    transition="0.2s ease-in-out"
                  ></Icon>
                </Flex>
              </Link>
            </NextLink>
          )}
        </Skeleton>
      </CardHeader>

      {/* Card Content */}
      {/* Author toggle container */}
      <Skeleton
        isLoaded={!isLoading}
        height={isLoading ? "150px" : "unset"}
        p={0}
        m={isLoading ? 4 : 0}
        startColor="page.alt"
        endColor="niaid.placeholder"
      >
        <Flex
          flexDirection={["column-reverse", "row"]}
          flexWrap={["wrap-reverse", "wrap"]}
          w="100%"
        >
          {author && (
            <ToggleContainer
              ariaLabel="Show all authors."
              noOfLines={1}
              justifyContent="flex-start"
              m={0}
              px={paddingCard}
              py={2}
              flex={1}
              w="100%"
              border="none"
              _focus={{ outlineColor: "transparent" }}
            >
              <Text fontSize="xs" color="text.body">
                {formatAuthorsList2String(author, ",", 10)}.
              </Text>
            </ToggleContainer>
          )}
          <ConditionsOfAccess />
        </Flex>

        {/* Banner with resource type + date of publication */}
        <TypeBanner
          type={type}
          pl={[2, 4, 6]}
          flexDirection={["column", "row"]}
          date={(() => {
            if (datePublished) {
              return `Published on ${formatDate(datePublished)}`;
            }
            if (!datePublished && date) {
              return `${formatDate(date)}`;
            }
          })()}
        ></TypeBanner>

        <>
          <CardBody>
            {/* Description Text */}
            <ToggleContainer
              ariaLabel="show more description"
              noOfLines={[3, 10]}
              px={paddingCard}
              py={[2, 4, 6]}
              my={0}
              borderColor="transparent"
              justifyContent="space-between"
              _focus={{ outlineColor: "transparent", bg: "white" }}
              alignIcon="center"
            >
              <Box
                w="100%"
                fontSize="sm"
                flex={1}
                dangerouslySetInnerHTML={{
                  __html: description?.replace(/\u00a0/g, " ") || "",
                }}
              ></Box>
            </ToggleContainer>

            {/* Details expandable drawer */}
            {license || measurementTechnique || variableMeasured ? (
              <Accordion allowToggle p={0} pt={1}>
                <AccordionItem>
                  {({ isExpanded }) => (
                    <>
                      <h2>
                        <AccordionButton
                          px={paddingCard}
                          bg={isExpanded ? "status.info_lt" : "white"}
                          _hover={{ bg: "status.info_lt" }}
                          aria-label="show more details about dataset"
                        >
                          <Box flex="1" textAlign="left">
                            <Heading fontSize="h6" fontWeight="semibold">
                              Details
                            </Heading>
                          </Box>
                          <Icon
                            as={isExpanded ? FaMinus : FaPlus}
                            fontSize="xs"
                          />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel w="100%" px={paddingCard}>
                        <UnorderedList ml={0}>
                          {license && (
                            <ListItem>
                              <Stat my={2}>
                                <StatLabel color="gray.700">License</StatLabel>
                                <dd>
                                  {licenseInfo && (
                                    <>
                                      {licenseInfo?.img && (
                                        <Image
                                          src={`${assetPrefix}${licenseInfo.img}`}
                                          alt={licenseInfo.type}
                                        />
                                      )}
                                      {licenseInfo?.url ? (
                                        <Link href={licenseInfo.url} isExternal>
                                          {licenseInfo.title}
                                        </Link>
                                      ) : (
                                        licenseInfo?.title
                                      )}
                                    </>
                                  )}
                                </dd>
                              </Stat>
                            </ListItem>
                          )}
                          {/* Measurement techniques*/}
                          {measurementTechnique && (
                            <ListItem>
                              <Stat my={2}>
                                <StatLabel color="gray.700">
                                  Measurement Technique
                                </StatLabel>
                                <dd>
                                  <UnorderedList ml={0}>
                                    {measurementTechnique.map((m, i) => {
                                      const name = Array.isArray(m.name)
                                        ? m.name.join(", ")
                                        : m.name;

                                      const MeasurementTechniqueLabel = () => (
                                        <Text fontWeight="semibold">
                                          {name}
                                        </Text>
                                      );

                                      return (
                                        <ListItem key={`${name}-${i}`}>
                                          {m.url ? (
                                            <Link href={m.url} isExternal>
                                              <MeasurementTechniqueLabel />
                                            </Link>
                                          ) : (
                                            <MeasurementTechniqueLabel />
                                          )}
                                        </ListItem>
                                      );
                                    })}
                                  </UnorderedList>
                                </dd>
                              </Stat>
                            </ListItem>
                          )}
                          {variableMeasured && (
                            <ListItem>
                              <Stat my={2}>
                                <StatLabel color="gray.700">
                                  Variable Measured
                                </StatLabel>
                                <dd>
                                  <Text fontWeight="semibold">
                                    {variableMeasured}
                                  </Text>
                                </dd>
                              </Stat>
                            </ListItem>
                          )}
                        </UnorderedList>
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              </Accordion>
            ) : (
              <Divider p={0} />
            )}

            {/* Source Repository Link + Altmetric badge */}

            {(doi || includedInDataCatalog?.name) && (
              <Flex
                px={paddingCard}
                py={{ base: 2, md: 4 }}
                my={0}
                flexDirection="row"
                flexWrap="wrap"
                alignItems="flex-end"
              >
                {includedInDataCatalog?.name && (
                  <Box minW={["250px"]} mb={[2, 2, 0]}>
                    {imageURL &&
                      (includedInDataCatalog.url ? (
                        <Link target="_blank" href={includedInDataCatalog.url}>
                          <Image
                            h="40px"
                            mr={2}
                            src={`${assetPrefix}${imageURL}`}
                            alt="Data source name"
                          ></Image>
                        </Link>
                      ) : (
                        <Image
                          h="40px"
                          mr={2}
                          src={`${assetPrefix}${imageURL}`}
                          alt="Data source name"
                        ></Image>
                      ))}
                    {url || includedInDataCatalog.url ? (
                      <Link
                        href={url! || includedInDataCatalog.url!}
                        isExternal
                      >
                        <Text fontSize={"xs"}>
                          Provided by {includedInDataCatalog.name}
                        </Text>
                      </Link>
                    ) : (
                      <Text fontSize={"xs"}>
                        Provided by {includedInDataCatalog.name}
                      </Text>
                    )}
                  </Box>
                )}
                {doi && (
                  <Flex
                    flex={1}
                    mt={[2, 2, 0]}
                    flexDirection="column"
                    alignItems={["flex-start", "flex-end"]}
                  >
                    <Text
                      fontSize="xs"
                      my={0}
                      fontWeight="medium"
                      lineHeight={1}
                    >
                      Altmetric
                    </Text>
                    {/* Altmetric embed badges don't allow for adding aria-label so VisuallyHidden is a patch */}
                    <VisuallyHidden>
                      See more information about resource on Altmetric
                    </VisuallyHidden>
                    <div
                      data-badge-popover="left"
                      data-badge-type="bar"
                      data-doi={`${formatDOI(doi)}`}
                      className="altmetric-embed"
                      data-link-target="blank"
                    ></div>
                  </Flex>
                )}
              </Flex>
            )}
          </CardBody>
        </>
      </Skeleton>
      <Skeleton
        isLoaded={!isLoading}
        height={isLoading ? "50px" : "unset"}
        p={0}
        m={isLoading ? 4 : 0}
        startColor="page.alt"
        endColor="niaid.placeholder"
      >
        <CardFooter
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          bg="page.alt"
          px={paddingCard}
          py={2}
        >
          {id && (
            <Flex w="100%" justifyContent="flex-end">
              <NextLink
                href={{
                  pathname: "/resources/",
                  query: { id },
                }}
                passHref
              >
                <Button
                  maxW={{ xl: "230px" }}
                  w="100%"
                  rightIcon={<FaArrowAltCircleRight />}
                  aria-label={`Go to details about resource ${name}`}
                >
                  See more
                  <VisuallyHidden> details about the dataset</VisuallyHidden>
                </Button>
              </NextLink>
            </Flex>
          )}
        </CardFooter>
      </Skeleton>
    </Card>
  );
};

export default SearchResultCard;
