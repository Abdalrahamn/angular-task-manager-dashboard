export type ActivityAction = 'create' | 'edit' | 'delete' | 'status_change' | 'complete';

export interface ActivityItem {
  id: string;
  action: ActivityAction;
  taskId: string;
  title: string;
  at: string;
}
