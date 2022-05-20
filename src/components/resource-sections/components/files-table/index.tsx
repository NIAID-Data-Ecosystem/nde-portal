import React from "react";
import { Box, Flex, Icon, Text } from "nde-design-system";
import { Distribution, FormattedResource } from "src/utils/api/types";
import { formatDate } from "src/utils/helpers";
import Table, { Row } from "src/components/table";
import LoadingSpinner from "src/components/loading";
import {
  FormatLinkCell,
  getFileIcon,
  getTableColumns,
} from "src/components/table/helpers";

interface FilesTable {
  isLoading: boolean;
  distribution?: FormattedResource["distribution"];
}

const FilesTable: React.FC<FilesTable> = ({ isLoading, distribution }) => {
  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  if (!distribution || distribution.length === 0) {
    return (
      <Box overflow="auto">
        <Text>No data available.</Text>
      </Box>
    );
  }

  const column_name_config = {
    "@id": "id",
    name: "Name",
    encodingFormat: "File Format",
    contentUrl: "Download",
    dateCreated: "Date Created",
    dateModified: "Date Modified",
    datePublished: "Date Published",
    description: "Description",
  } as Record<keyof Distribution, string>;

  const columns =
    distribution && getTableColumns(distribution!, column_name_config, false);

  // Format rows
  const rows = distribution.map((d) => {
    let obj = {} as Row;

    Object.entries(d).map(([k, v]) => {
      let value = v;
      let { icon, color } = getFileIcon(v);

      // Format date values.
      if (k.toLowerCase().includes("date")) {
        value = formatDate(v);
      }

      if (k === "encodingFormat" && icon && color) {
        value = (
          <Flex alignItems="baseline">
            <Icon as={icon} color={color} boxSize={6} aria-label={v} />
            <Text pt={2} ml={1} fontSize="sm" fontWeight="semibold">
              <FormatLinkCell value={v} />
            </Text>
          </Flex>
        );
      }
      if (k.toLowerCase() === "contenturl" && icon && color) {
        value = (
          <Text>
            <FormatLinkCell value={v} isExternal={false} target="_blank" />
            <Icon
              as={icon}
              color={color}
              boxSize={8}
              aria-label={v}
              pt={2}
              ml={1}
            />
          </Text>
        );
      }
      obj[k] = {
        value,
      };
    });
    return obj;
  });

  return (
    <Table
      columns={columns}
      rowData={rows}
      caption={"Files available for download."}
    />
  );
};

export default FilesTable;
