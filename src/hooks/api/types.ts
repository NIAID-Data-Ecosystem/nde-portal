export interface MetadataSource {
  code: {
    file: string;
    repo: string;
    commit: string;
    branch: string;
    url: string;
  };
  sourceInfo: {
    name: string;
    abstract?: string;
    description: string;
    schema: Object | null;
    url: string;
    identifier: string;
    conditionsOfAccess?: string;
  };
  stats: { [key: string]: number };
  version: string;
}

export interface Metadata {
  biothing_type: string;
  build_date: string;
  build_version: string;
  src: {
    [key: string]: MetadataSource;
  };
}
