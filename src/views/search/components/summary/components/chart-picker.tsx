import { ChartType } from '../types';

export const ChartTypePicker = (props: {
  value: ChartType;
  options: ChartType[];
  onChange: (next: ChartType) => void;
  isDisabled?: boolean;
}) => {
  return (
    <select
      value={props.value}
      disabled={props.isDisabled}
      onChange={e => props.onChange(e.target.value as ChartType)}
    >
      {props.options.map(o => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
};
