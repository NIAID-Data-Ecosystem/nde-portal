export interface ResourceMetadata {
  title: string;
  property: string;
  description?: {
    [key: string]: string;
  };
}
