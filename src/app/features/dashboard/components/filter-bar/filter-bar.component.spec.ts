import { TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar.component';

const jane = { id: 'user-001', name: 'Jane Doe', avatar: 'JD', email: 'jane@company.com' };

describe('FilterBar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FilterBar] }).compileComponents();
  });

  it('should emit tab, priority, assignee, clear, and create events', () => {
    const fixture = TestBed.createComponent(FilterBar);
    fixture.componentRef.setInput('statusTab', 'all');
    fixture.componentRef.setInput('assignees', [jane]);
    fixture.componentRef.setInput('canClear', true);
    fixture.detectChanges();

    const events: unknown[] = [];
    fixture.componentInstance.statusTabChange.subscribe((value) => events.push(value));
    fixture.componentInstance.priorityChange.subscribe((value) => events.push(value));
    fixture.componentInstance.assigneeIdChange.subscribe((value) => events.push(value));
    fixture.componentInstance.clear.subscribe(() => events.push('clear'));
    fixture.componentInstance.create.subscribe(() => events.push('create'));

    const el = fixture.nativeElement as HTMLElement;
    el.querySelectorAll<HTMLButtonElement>('[role="group"] button')[1].click();
    const selects = el.querySelectorAll('select');
    selects[0].value = 'high';
    selects[0].dispatchEvent(new Event('change'));
    selects[0].value = '';
    selects[0].dispatchEvent(new Event('change'));
    selects[1].value = 'user-001';
    selects[1].dispatchEvent(new Event('change'));
    selects[1].value = '';
    selects[1].dispatchEvent(new Event('change'));
    const actionButtons = [...el.querySelectorAll<HTMLButtonElement>('button')];
    actionButtons.find((button) => button.textContent?.includes('Clear filters'))!.click();
    actionButtons.find((button) => button.textContent?.includes('New Task'))!.click();

    expect(events).toEqual(['todo', 'high', null, 'user-001', null, 'clear', 'create']);
  });
});
