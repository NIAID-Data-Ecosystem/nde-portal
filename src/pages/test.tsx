import { uniqueId } from 'lodash';
import { Box } from 'nde-design-system';
import { collapseTree } from 'src/components/advanced-search/components/SortableWithCombine';
import { convertQueryString2Object } from 'src/components/advanced-search/utils/query-helpers';

function findClosingBracketMatchIndex(str, pos) {
  if (str[pos] != '(') {
    throw new Error("No '(' at index " + pos);
  }
  let depth = 1;
  for (let i = pos + 1; i < str.length; i++) {
    switch (str[i]) {
      case '(':
        depth++;
        break;
      case ')':
        if (--depth == 0) {
          return i;
        }
        break;
    }
  }
  return -1; // No matching closing parenthesis
}

const Test = () => {
  const exOne =
    '((Candida) OR (C. albicans) OR (C. glabrata) OR (C. parapsilosis) OR (C. tropicalis) OR (C. auris)) OR ((Cryptococcus) OR (cryptococcal meningitis) OR (Cryptococcosis) OR (C. neoformans) OR (C. gattii)) OR ((Aspergillosis) OR (Aspergillus)) OR ((Coccidioidomycosis) OR (C. immitis) OR (Coccidioides) OR (C. posadasii)) OR ((Histoplasma) OR (Histoplasmosis) OR (H. capsulatum)) OR ((*Blastomyc*) OR (B. dermatitidis)) OR ((Pneumocystis) OR (P. jirovecii) OR (P. carinii))';

  const exTwo = `("Warts, hypogammaglobulinemia, infections, and myelokathexis syndrome") OR ("WHIM Syndrome")`;

  const exThree = `(West Siberian virus) OR (((Tickborne encephalitis) OR (Tick-borne encephalitis)) AND (Siberian subtype))`;
  const exFour = '( @type: Dataset) AND (_exists_: name)';
  const exFive =
    '(@type: (Dataset)) AND (_exists_:name) OR (name:**Covid** AND **longitudinal** AND **study**) OR (name:"covid longitudinal study")';

  // (@type:Dataset) AND (_exists_:name) OR (name:**Covid** AND **longitudinal** AND **study**) OR (name:"covid longitudinal study") OR (name:**shervinmin\/DeepCovid\:** AND **First** AND **release** AND **of** AND **DeepCovid**)

  //  OR (((Tickborne encephalitis) OR (Tick-borne encephalitis)) AND (Siberian subtype)) AND ([@type:](Dataset))`;

  // const defaultObject = {
  //   id: '',
  //      children: [],
  //   value: { term: '', union: '', field: '' },
  //   parentId: null,
  //   depth: 0,
  // };

  const result = convertQueryString2Object(exFive);

  return (
    <Box p={6}>
      <div>
        Original string:
        {exTwo}
      </div>
      <br />
      <div>
        Desired Result:
        {JSON.stringify(exFour)}
      </div>
      {/* {convertQueryString2Object(exTwo)} */}
    </Box>
  );
};

export default Test;
