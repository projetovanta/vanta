import React from 'react';

interface Props {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

const GRID_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export default function MetricGrid({ children, columns = 2 }: Props) {
  return <div className={`grid gap-3 ${GRID_CLASSES[columns]}`}>{children}</div>;
}
