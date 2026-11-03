import { FormattedResource } from 'src/utils/api/types';

export interface ResourceBannerProps {
  data?: FormattedResource;
}

export interface BannerDate {
  label?: string;
  value: string;
}
