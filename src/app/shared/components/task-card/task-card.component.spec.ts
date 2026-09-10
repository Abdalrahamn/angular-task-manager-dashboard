import { TestBed } from '@angular/core/testing';
import { Task } from '../../models/task.model';
import { TaskCard } from './task-card.component';

const jane = { id: 'user-001', name: 'Jane Doe', avatar: 'JD', email: 'jane@company.com' };

function task(overrides: Partial<Task> = {}): Task {
  return {
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
    ...overrides,
  };
}

describe('TaskCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard],
    }).compileComponents();
  });

  it('should mark To Do tasks for the blue hover variant and emit edit from the menu', () => {
    const fixture = TestBed.createComponent(TaskCard);
    fixture.componentRef.setInput('task', task());
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.task-card--todo')).toBeTruthy();
    expect(el.textContent).toContain('Design homepage');
    expect(el.textContent).toContain('@Jane');
    expect(el.querySelector('.task-card__status-icon')?.textContent?.trim()).toBe('📅');

    let edited: Task | undefined;
    let moved: { status: string } | undefined;
    fixture.componentInstance.edit.subscribe((value) => {
      edited = value;
    });
    fixture.componentInstance.move.subscribe((value) => {
      moved = value;
    });
    el.querySelector<HTMLButtonElement>('.task-card__menu')!.click();
    fixture.detectChanges();
    expect(document.querySelector('.mat-mdc-menu-panel')).toBeTruthy();
    document.querySelector<HTMLButtonElement>('button[mat-menu-item]')!.click();
    expect(edited?.id).toBe('task-001');

    el.querySelector<HTMLButtonElement>('.task-card__menu')!.click();
    fixture.detectChanges();
    [...document.querySelectorAll<HTMLButtonElement>('button[mat-menu-item]')]
      .find((item) => item.textContent?.includes('Move to In Progress'))!
      .click();
    expect(moved?.status).toBe('in_progress');
  });

  it('should mark overdue and completed variants', () => {
    const fixture = TestBed.createComponent(TaskCard);
    fixture.componentRef.setInput('task', task({ dueDate: '2000-01-01', tags: [] }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task-card--overdue')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Overdue by');
    expect(
      fixture.nativeElement.querySelector('.task-card__status-icon')?.textContent?.trim(),
    ).toBe('⚠️');
    expect(fixture.nativeElement.querySelector('.task-card__category')).toBeNull();

    fixture.componentRef.setInput(
      'task',
      task({
        status: 'done',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task-card--completed')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.task-card--todo')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Completed today');
    expect(
      fixture.nativeElement.querySelector('.task-card__status-icon')?.textContent?.trim(),
    ).toBe('✅');
  });

  it('should select orange and green hover variants from task status', () => {
    const fixture = TestBed.createComponent(TaskCard);
    fixture.componentRef.setInput('task', task({ status: 'in_progress', priority: 'medium' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task-card--in-progress')).toBeTruthy();

    fixture.componentRef.setInput(
      'task',
      task({ status: 'done', completedAt: new Date().toISOString() }),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task-card--completed')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.task-card--in-progress')).toBeNull();
  });

  it('should emit move and delete from the menu', () => {
    const fixture = TestBed.createComponent(TaskCard);
    fixture.componentRef.setInput('task', task({ status: 'in_progress', priority: 'low' }));
    fixture.detectChanges();

    let moved: { status: string } | undefined;
    let removed: Task | undefined;
    fixture.componentInstance.move.subscribe((value) => {
      moved = value;
    });
    fixture.componentInstance.remove.subscribe((value) => {
      removed = value;
    });

    fixture.nativeElement.querySelector('.task-card__menu').click();
    fixture.detectChanges();
    const items = [...document.querySelectorAll<HTMLButtonElement>('button[mat-menu-item]')];
    expect(items.map((item) => item.textContent?.trim())).toContain('Move to To Do');
    expect(items.map((item) => item.textContent?.trim())).toContain('Move to Done');
    items.find((item) => item.textContent?.includes('Move to Done'))!.click();
    expect(moved?.status).toBe('done');

    fixture.nativeElement.querySelector('.task-card__menu').click();
    fixture.detectChanges();
    [...document.querySelectorAll<HTMLButtonElement>('button[mat-menu-item]')]
      .find((item) => item.textContent?.includes('Move to To Do'))!
      .click();
    expect(moved?.status).toBe('todo');

    fixture.nativeElement.querySelector('.task-card__menu').click();
    fixture.detectChanges();
    [...document.querySelectorAll<HTMLButtonElement>('button[mat-menu-item]')]
      .find((item) => item.textContent?.includes('Delete'))!
      .click();
    expect(removed?.id).toBe('task-001');
  });
});
