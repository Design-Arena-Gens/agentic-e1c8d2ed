'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import type { ChartOptions, TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TestosteroneEntry } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
);

type Props = {
  entries: TestosteroneEntry[];
};

export function LevelChart({ entries }: Props) {
  const labs = entries
    .filter((entry) => entry.eventType === 'lab' && entry.levelNgDl)
    .sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
    );

  if (labs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/60">
        Добавьте результаты анализов, чтобы построить график уровня
        тестостерона.
      </div>
    );
  }

  const labels = labs.map((entry) =>
    format(parseISO(entry.date), 'd MMM', { locale: ru }),
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Тестостерон, нг/дл',
        data: labs.map((entry) => entry.levelNgDl),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.25,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          color: '#d1fae5',
        },
        grid: {
          color: 'rgba(255,255,255,0.08)',
        },
      },
      x: {
        ticks: {
          color: '#d1d5db',
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#ecfeff',
        },
      },
      tooltip: {
        callbacks: {
          label(context: TooltipItem<'line'>) {
            const value = context.parsed.y;
            return ` ${value} нг/дл`;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Динамика уровня тестостерона
          </h3>
          <p className="text-sm text-white/60">
            Используйте регулярные лабораторные измерения для контроля терапевтического окна.
          </p>
        </div>
      </header>
      <Line data={data} options={options} />
    </div>
  );
}
