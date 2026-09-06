import { ActivityItem } from '../models/activity.model';

export function activityDescription(item: Pick<ActivityItem, 'action' | 'title'>): string {
  switch (item.action) {
    case 'create':
      return `Created “${item.title}”`;
    case 'edit':
      return `Updated “${item.title}”`;
    case 'delete':
      return `Deleted “${item.title}”`;
    case 'complete':
      return `Completed “${item.title}”`;
    case 'status_change':
      return `Moved “${item.title}”`;
  }
}
