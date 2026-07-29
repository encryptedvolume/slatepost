'use client';

import { FC, useEffect, useMemo, useRef } from 'react';
import DrawChart from 'chart.js/auto';
import { TotalList } from '@gitroom/frontend/components/analytics/stars.and.forks.interface';
import { chunk } from 'lodash';

function mergeDataPoints(data: TotalList[], numPoints: number): TotalList[] {
  const res = chunk(data, Math.ceil(data.length / numPoints));
  return res.map((row) => {
    return {
      date: `${row[0].date} - ${row?.at(-1)?.date}`,
      total: row.reduce((acc, curr) => acc + curr.total, 0),
    };
  });
}

// Chart.js paints to a canvas, so it cannot resolve `var(--slate-*)` itself.
// The token is read off the canvas element instead — custom properties
// inherit, so this picks up whichever theme the element is sitting in.
const token = (el: HTMLElement, name: string) =>
  getComputedStyle(el).getPropertyValue(name).trim();

// Each card carries one series on its own axis, so the rank below is
// decoration, not a categorical encoding — nothing is being told apart by
// hue. It steps down the neutral text ramp and matches the dot on the card
// header.
const seriesToken = {
  primary: '--slate-text-primary',
  secondary: '--slate-text-secondary',
  tertiary: '--slate-text-tertiary',
} as const;

export const ChartSocial: FC<{
  data: TotalList[];
  color?: keyof typeof seriesToken;
}> = (props) => {
  const { data, color = 'primary' } = props;

  const list = useMemo(() => {
    const merged = data.length < 7 ? data : mergeDataPoints(data, 7);
    if (merged.length === 1) {
      return [
        // duplicating single datapoints metrics for chart to display a line on analytics
        merged[0],
        merged[0],
      ];
    }
    return merged;
  }, [data]);

  const ref = useRef<any>(null);
  const chart = useRef<null | DrawChart>(null);

  useEffect(() => {
    const el = ref.current as HTMLElement;
    const line = token(el, seriesToken[color]);
    const ctx = ref.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, ref.current.height);
    // The area fill is the surface stepping back to the card, not a second
    // colour.
    gradient.addColorStop(0, token(el, '--slate-surface-active'));
    gradient.addColorStop(1, token(el, '--slate-surface'));

    chart.current = new DrawChart(ref.current!, {
      type: 'line',
      options: {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
          duration: 750,
          easing: 'easeOutQuart',
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 4,
            bottom: 0,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            display: false,
          },
          x: {
            display: false,
            ticks: {
              stepSize: 10,
              maxTicksLimit: 7,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: token(el, '--slate-surface-overlay'),
            titleColor: token(el, '--slate-text-secondary'),
            bodyColor: token(el, '--slate-text-primary'),
            borderColor: token(el, '--slate-line'),
            borderWidth: 1,
            padding: 10,
            // A tooltip is a popover: card radius, and the one elevation
            // shadow the product ships (Chart.js draws no shadow, so the
            // hairline carries the separation).
            cornerRadius: 14,
            displayColors: false,
            // Caption over control — the same two steps the rest of the
            // product uses for a label above a value. Chart.js needs the
            // numbers literally; they are the scale, not loose figures.
            titleFont: {
              family: token(el, '--slate-font-ui'),
              size: 12,
              weight: 500,
            },
            bodyFont: {
              family: token(el, '--slate-font-ui'),
              size: 14,
              weight: 500,
            },
          },
        },
      },
      data: {
        labels: list.map((row) => row.date),
        datasets: [
          {
            borderColor: line,
            borderWidth: 2,
            label: 'Total',
            backgroundColor: gradient,
            fill: true,
            data: list.map((row) => row.total),
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: line,
            pointHoverBorderColor: token(el, '--slate-surface'),
            pointHoverBorderWidth: 2,
          },
        ],
      },
    });
    return () => {
      chart?.current?.destroy();
    };
  }, []);

  return <canvas className="w-full h-full" ref={ref} />;
};
