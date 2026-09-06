import { TestBed } from '@angular/core/testing';
import { UserAvatar } from './user-avatar.component';

const jane = { id: 'user-001', name: 'Jane Doe', avatar: 'JD', email: 'jane@company.com' };

describe('UserAvatar', () => {
  it('should render initials and the medium size class', async () => {
    await TestBed.configureTestingModule({ imports: [UserAvatar] }).compileComponents();
    const fixture = TestBed.createComponent(UserAvatar);
    fixture.componentRef.setInput('assignee', jane);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('JD');
    const avatar = fixture.nativeElement.querySelector('span') as HTMLSpanElement;
    expect(avatar.classList.contains('!tw:size-[var(--size-header-control)]')).toBe(false);
    expect(avatar.classList.contains('tw:size-[var(--size-avatar-sm)]')).toBe(true);
    expect(avatar.classList.contains('tw:shrink-0')).toBe(true);
    expect(avatar.classList.contains('tw:!text-[length:var(--font-size-badge)]')).toBe(true);
    expect(avatar.classList.contains('tw:!text-[color:var(--color-white-solid)]')).toBe(true);
    expect(avatar.classList.contains('tw:leading-[var(--line-height-16)]')).toBe(true);

    fixture.componentRef.setInput('size', 'md');
    fixture.detectChanges();
    expect(avatar.classList.contains('!tw:size-[var(--size-header-control)]')).toBe(true);
    expect(
      avatar.classList.contains('!tw:text-[length:var(--font-size-avatar-initials)]'),
    ).toBe(true);
  });
});
