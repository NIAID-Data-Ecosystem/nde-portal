export interface ResourceMetadata {
  title: string;
  property: string;
  description?: {
    [key: string]: string;
  };
  abstract?: {
    [key: string]: string;
  };
  items?: {
    [key: string]: { description: string };
  };
}
