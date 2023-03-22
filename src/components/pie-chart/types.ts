export interface RawDataProps {
  term: string;
  count: number;
  abstract?: string;
  genre?: string[];
  value?: string;
}

export interface DataProps {
  term: string;
  count: number;
  data?: RawDataProps[];
  genre?: string[];
  abstract?: string;
  value?: string;
}
