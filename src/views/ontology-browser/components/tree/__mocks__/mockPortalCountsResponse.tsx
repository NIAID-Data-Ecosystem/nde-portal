import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';
export const PAGINATED_MOCK_COUNTS = {
  '2686027': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '2608240': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '2598132': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '2489521': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '2795258': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '1401294': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '554296': {
    counts: {
      termCount: 1,
      termAndChildrenCount: 2,
    },
  },

  '38254': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '2683617': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '61964': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '42452': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 0,
    },
  },

  '3027': {
    counts: {
      termCount: 3,
      termAndChildrenCount: 40,
    },
  },

  '2608109': {
    counts: {
      termCount: 0,
      termAndChildrenCount: 139,
    },
  },

  '2611341': {
    counts: {
      termCount: 2,
      termAndChildrenCount: 172,
    },
  },

  '2763': {
    counts: {
      termCount: 38,
      termAndChildrenCount: 439,
    },
  },

  '554915': {
    counts: {
      termCount: 10,
      termAndChildrenCount: 474,
    },
  },

  '2698737': {
    counts: {
      termCount: 57,
      termAndChildrenCount: 5389,
    },
  },

  '2611352': {
    counts: {
      termCount: 1,
      termAndChildrenCount: 8172,
    },
  },

  '33090': {
    counts: {
      termCount: 31,
      termAndChildrenCount: 70008,
    },
  },
  '33154': {
    counts: {
      termCount: 9,
      termAndChildrenCount: 461848,
    },
  },
};
export const mockPortalCountsResponse = (
  children: OntologyLineageItemWithCounts[],
) => {
  const MOCK_COUNTS = {
    ...PAGINATED_MOCK_COUNTS,
    '9592': { counts: { termCount: 0, termAndChildrenCount: 96 } },
    '9596': { counts: { termCount: 148, termAndChildrenCount: 438 } },
    '9605': { counts: { termCount: 2661, termAndChildrenCount: 260199 } },
  } as { [key: string]: { counts: OntologyLineageItemWithCounts['counts'] } };
  return children.map(child => ({
    ...child,
    counts: MOCK_COUNTS[child.taxonId]['counts'] || {
      termCount: 50,
      termAndChildrenCount: 100,
    },
  }));
};

export const mockPortalCountsPaginatedResponse = (
  children: OntologyLineageItemWithCounts[],
) => {
  const MOCK_COUNTS = {
    '2686027': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 1,
      },
    },

    '2608240': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 1,
      },
    },

    '2598132': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 1,
      },
    },

    '2489521': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 1,
      },
    },

    '2795258': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 2,
      },
    },

    '1401294': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 2,
      },
    },

    '554296': {
      counts: {
        termCount: 1,
        termAndChildrenCount: 2,
      },
    },

    '38254': {
      counts: {
        termCount: 1,
        termAndChildrenCount: 5,
      },
    },

    '2683617': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 11,
      },
    },

    '61964': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 18,
      },
    },

    '42452': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 19,
      },
    },

    '3027': {
      counts: {
        termCount: 3,
        termAndChildrenCount: 40,
      },
    },

    '2608109': {
      counts: {
        termCount: 0,
        termAndChildrenCount: 139,
      },
    },

    '2611341': {
      counts: {
        termCount: 2,
        termAndChildrenCount: 172,
      },
    },

    '2763': {
      counts: {
        termCount: 38,
        termAndChildrenCount: 439,
      },
    },

    '554915': {
      counts: {
        termCount: 10,
        termAndChildrenCount: 474,
      },
    },

    '2698737': {
      counts: {
        termCount: 57,
        termAndChildrenCount: 5389,
      },
    },

    '2611352': {
      counts: {
        termCount: 1,
        termAndChildrenCount: 8172,
      },
    },

    '33090': {
      counts: {
        termCount: 31,
        termAndChildrenCount: 70008,
      },
    },
    '33154': {
      counts: {
        termCount: 9,
        termAndChildrenCount: 461848,
      },
    },
  } as { [key: string]: { counts: OntologyLineageItemWithCounts['counts'] } };
  return children.map(child => ({
    ...child,
    counts: MOCK_COUNTS[child.taxonId]['counts'],
  }));
};
