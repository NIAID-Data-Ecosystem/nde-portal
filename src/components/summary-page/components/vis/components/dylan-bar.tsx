import React from 'react';
import {
  Chart as ChartJS,
  BarElement,
  LinearScale,
  CategoryScale,
  TimeScale,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  ChartDataLabels,
);

const plugins = [
  {
    id: 'BarChartId',
    afterDraw: function (chart: any) {
      if (chart.data.datasets[0].data.length < 1) {
        let ctx = chart.ctx;
        let width = chart.width;
        let height = chart.height;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.font = '30px Public Sans';
        ctx.fillText('No data to display', width / 2, height / 2);
        ctx.restore();
      }
    },
  },
];

interface DylanBarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[] | readonly string[];
      radius?: number[];
      otherNames?: string[];
      borderWidth: number;
      borderColor?: string[];
      maxBarThickness?: number;
      minBarLength?: number;
    }[];
  };
  options: any;
}
const DylanBarChart: React.FC<DylanBarChartProps> = ({ data, options }) => {
  return <Bar data={data} options={options} plugins={plugins} />;
};
export default DylanBarChart;
