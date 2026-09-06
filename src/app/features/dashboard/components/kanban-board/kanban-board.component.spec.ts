import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { Task } from '../../../../shared/models/task.model';
import { KanbanColumn } from '../kanban-column/kanban-column.component';
import { KanbanBoard } from './kanban-board.component';

const jane = { id: 'user-001', name: 'Jane Doe', avatar: 'JD', email: 'jane@company.com' };
const task: Task = {
  id: 'task-001',
  title: 'Design homepage',
  description: 'Create mockups',
  status: 'todo',
  priority: 'medium',
  dueDate: '2099-01-01',
  assignee: jane,
  tags: ['Design'],
  createdAt: '2099-01-01T00:00:00.000Z',
  updatedAt: '2099-01-01T00:00:00.000Z',
};

describe('KanbanBoard', () => {
  it('should render three columns and forward events', async () => {
    await TestBed.configureTestingModule({ imports: [KanbanBoard] }).compileComponents();
    const fixture = TestBed.createComponent(KanbanBoard);
    fixture.componentRef.setInput('columns', {
      todo: [task],
      in_progress: [],
      done: [],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-kanban-column')).toHaveLength(3);

    let edited: Task | undefined;
    fixture.componentInstance.editTask.subscribe((value) => {
      edited = value;
    });
    const columns = fixture.debugElement.queryAll(By.directive(KanbanColumn));
    columns.forEach((columnDebug) => {
      const column = columnDebug.componentInstance as KanbanColumn;
      column.editTask.emit(task);
      column.deleteTask.emit(task);
      column.moveTask.emit({ task, status: 'done' });
      column.dropped.emit({
        task,
        previousIndex: 0,
        currentIndex: 0,
        fromStatus: 'todo',
        toStatus: 'todo',
      });
    });
    expect(edited).toBe(task);
  });

  it('should select columns from tabs and support arrow-key navigation', async () => {
    await TestBed.configureTestingModule({ imports: [KanbanBoard] }).compileComponents();
    const fixture = TestBed.createComponent(KanbanBoard);
    fixture.componentRef.setInput('columns', { todo: [task], in_progress: [], done: [] });
    fixture.detectChanges();

    const tabs = fixture.nativeElement.querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(tabs).toHaveLength(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');

    tabs[1].click();
    fixture.detectChanges();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');

    tabs[0].click();
    fixture.detectChanges();
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');

    tabs[2].click();
    fixture.detectChanges();
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');

    tabs[1].click();
    fixture.detectChanges();
    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');

    tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');

    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');

    tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
  });
});
