import React from "react";
import { Box, Text } from "nde-design-system";
import { CitedBy, FormattedResource } from "src/utils/api/types";
import Table, { Row } from "src/components/table";
import LoadingSpinner from "src/components/loading";
import { getTableColumns } from "src/components/table/helpers";
import { formatDate } from "src/utils/helpers";

interface CitedByTable {
  isLoading: boolean;
  citedBy?: FormattedResource["citedBy"];
}

const formatType = (type: string) => {
  if (type.toLowerCase() === "scholarlyarticle") {
    return "Scholarly Article";
  }
  return type;
};

const CitedByTable: React.FC<CitedByTable> = ({ isLoading, citedBy }) => {
  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  if (!citedBy || citedBy.length === 0) {
    return (
      <Box overflow="auto">
        <Text>No citedBy data available.</Text>
      </Box>
    );
  }

  const column_name_config = {
    "@type": "Type",
    abstract: "Abstract",
    citation: "citation",
    datePublished: "Date Published",
    description: "Description",
    doi: "DOI",
    identifier: "Identifier",
    name: "name",
    pmid: "PMID",
    url: "URL",
  } as Record<keyof CitedBy, string>;

  const columns =
    citedBy && getTableColumns(citedBy, column_name_config, false);

  // Format rows
  const rows = citedBy.map((d) => {
    let obj = {} as Row;
    Object.entries(d).map(([k, v]) => {
      let value = v;
      // Format date values.
      if (k.toLowerCase().includes("date")) {
        value = formatDate(v);
      }

      if (k.toLowerCase() === "@type") {
        value = formatType(v);
      }

      obj[k] = {
        value,
      };
    });
    return obj;
  });

  return (
    <Table columns={columns} rowData={rows} caption={"Cited by information."} />
  );
};

export default CitedByTable;
