import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { TaskCard } from '../../../../shared/components/task-card/task-card.component';
import { TaskDropEvent } from '../../../../shared/models/kanban.model';
import { Task } from '../../../../shared/models/task.model';
import { KanbanColumn } from './kanban-column.component';

const jane = { id: 'user-001', name: 'Jane Doe', avatar: 'JD', email: 'jane@company.com' };
const task: Task = {
  id: 'task-001',
  title: 'Design homepage',
  description: 'Create mockups',
  status: 'todo',
  priority: 'high',
  dueDate: '2099-01-01',
  assignee: jane,
  tags: ['Design'],
  createdAt: '2099-01-01T00:00:00.000Z',
  updatedAt: '2099-01-01T00:00:00.000Z',
};

describe('KanbanColumn', () => {
  it('should show an empty state and emit a mapped drop', async () => {
    await TestBed.configureTestingModule({ imports: [KanbanColumn] }).compileComponents();
    const fixture = TestBed.createComponent(KanbanColumn);
    fixture.componentRef.setInput('title', 'To Do');
    fixture.componentRef.setInput('status', 'todo');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No tasks');

    let dropped: TaskDropEvent | undefined;
    fixture.componentInstance.dropped.subscribe((value) => {
      dropped = value;
    });
    fixture.componentInstance.onDrop({
      item: { data: task },
      previousIndex: 0,
      currentIndex: 1,
      previousContainer: { id: 'in_progress' },
    } as never);
    expect(dropped).toEqual({
      task,
      previousIndex: 0,
      currentIndex: 1,
      fromStatus: 'in_progress',
      toStatus: 'todo',
    });
  });

  it('should render cards when tasks are present', async () => {
    await TestBed.configureTestingModule({ imports: [KanbanColumn] }).compileComponents();
    const fixture = TestBed.createComponent(KanbanColumn);
    fixture.componentRef.setInput('title', 'To Do');
    fixture.componentRef.setInput('status', 'todo');
    fixture.componentRef.setInput('tasks', [task]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Design homepage');
    expect(fixture.nativeElement.querySelector('.column__count')?.textContent).toContain('1');
    const card = fixture.debugElement.query(By.directive(TaskCard)).componentInstance as TaskCard;
    card.edit.emit(task);
    card.remove.emit(task);
    card.move.emit({ task, status: 'done' });
    fixture.debugElement.query(By.css('[cdkDropList]')).triggerEventHandler('cdkDropListDropped', {
      item: { data: task },
      previousIndex: 0,
      currentIndex: 0,
      previousContainer: { id: 'todo' },
    });
  });
});
