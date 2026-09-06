export type ChangeType = 'positive' | 'negative' | 'neutral';
export type StatisticTitle = 'Total Tasks' | 'Completed' | 'In Progress' | 'Overdue';

export interface Statistic {
  id: string;
  title: StatisticTitle;
  icon: string;
  value: number;
  change: string;
  changeLabel: string;
  changeType: ChangeType;
  color: string;
}
