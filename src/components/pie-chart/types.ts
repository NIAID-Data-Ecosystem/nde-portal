export interface RawDataProps {
  term: string;
  count: number;
}

export interface DataProps {
  term: string;
  count: number;
  data?: RawDataProps[];
}
