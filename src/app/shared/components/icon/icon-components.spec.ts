import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AddIconComponent,
  AnalyticsIconComponent,
  BarChartIconComponent,
  BrandIconComponent,
  CalendarIconComponent,
  CheckBoxIconComponent,
  CheckCircleIconComponent,
  DashboardIconComponent,
  MenuIconComponent,
  MoreVerticalIconComponent,
  NotificationsIconComponent,
  ProgressIconComponent,
  SearchIconComponent,
  SettingsIconComponent,
  TasksIconComponent,
  TeamIconComponent,
  WarningIconComponent,
  BaseIconComponent,
  DynamicIconComponent,
} from '.';

describe('icon components', () => {
  const iconComponents: Type<BaseIconComponent>[] = [
    AddIconComponent,
    AnalyticsIconComponent,
    BarChartIconComponent,
    BrandIconComponent,
    CalendarIconComponent,
    CheckBoxIconComponent,
    CheckCircleIconComponent,
    DashboardIconComponent,
    MenuIconComponent,
    MoreVerticalIconComponent,
    NotificationsIconComponent,
    ProgressIconComponent,
    SearchIconComponent,
    SettingsIconComponent,
    TasksIconComponent,
    TeamIconComponent,
    WarningIconComponent,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [...iconComponents, BaseIconComponent, DynamicIconComponent],
    }).compileComponents();
  });

  it('provides the shared base inputs and host behavior', () => {
    const fixture = TestBed.createComponent(BaseIconComponent);
    fixture.componentRef.setInput('iconClass', 'base-icon');
    fixture.detectChanges();

    expect(fixture.componentInstance.width()).toBe('100%');
    expect(fixture.componentInstance.height()).toBe('100%');
    expect(fixture.nativeElement.style.display).toBe('inline-flex');
  });

  it.each(iconComponents)('renders %s with inherited inputs', (iconComponent) => {
    const fixture = TestBed.createComponent(iconComponent);
    fixture.componentRef.setInput('iconClass', 'test-icon');
    fixture.componentRef.setInput('width', '20');
    fixture.componentRef.setInput('height', '18');
    fixture.componentRef.setInput('viewBox', '0 0 24 24');
    fixture.componentRef.setInput('fill', 'none');
    fixture.componentRef.setInput('stroke', 'currentColor');
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('width')).toBe('20');
    expect(svg.getAttribute('height')).toBe('18');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.classList.contains('test-icon')).toBe(true);

    fixture.componentRef.setInput('label', 'Descriptive icon');
    fixture.detectChanges();
    expect(svg.getAttribute('aria-label')).toBe('Descriptive icon');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.hasAttribute('aria-hidden')).toBe(false);
  });

  it('renders the component selected by the dynamic registry', () => {
    const fixture: ComponentFixture<DynamicIconComponent> =
      TestBed.createComponent(DynamicIconComponent);
    fixture.componentRef.setInput('name', 'search');
    fixture.componentRef.setInput('iconClass', 'dynamic-icon');
    fixture.componentRef.setInput('width', '16');
    fixture.componentRef.setInput('height', '16');
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('data-icon')).toBe('search');
    expect(svg.classList.contains('dynamic-icon')).toBe(true);
  });
});
