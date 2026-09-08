import { TestBed } from '@angular/core/testing';
import { IconButtonComponent } from './icon-button.component';

describe('IconButtonComponent', () => {
  async function render(
    inputs: Partial<{
      variant: 'bare' | 'ghost' | 'primary' | 'primary-compact' | 'outlined';
      size: 'sm' | 'md' | 'lg';
      disabled: boolean;
    }> = {},
  ) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [IconButtonComponent] }).compileComponents();
    const fixture = TestBed.createComponent(IconButtonComponent);
    fixture.componentRef.setInput('ariaLabel', 'Action');
    if (inputs.variant) {
      fixture.componentRef.setInput('variant', inputs.variant);
    }
    if (inputs.size) {
      fixture.componentRef.setInput('size', inputs.size);
    }
    if (inputs.disabled !== undefined) {
      fixture.componentRef.setInput('disabled', inputs.disabled);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('should emit clicked when enabled', async () => {
    const fixture = await render();
    let clicks = 0;
    fixture.componentInstance.clicked.subscribe(() => {
      clicks += 1;
    });
    fixture.nativeElement.querySelector('button').click();
    expect(clicks).toBe(1);
  });

  it('should apply ghost and size utilities', async () => {
    const fixture = await render({ variant: 'ghost', size: 'sm' });
    expect(fixture.nativeElement.querySelector('button').className).toContain(
      'tw:rounded-[var(--radius-20)]',
    );
  });

  it('should apply primary and large size utilities', async () => {
    const fixture = await render({ variant: 'primary', size: 'lg' });
    expect(fixture.nativeElement.querySelector('button').className).toContain('tw:w-full');
  });

  it('should apply primary-compact width', async () => {
    const fixture = await render({ variant: 'primary-compact' });
    expect(fixture.nativeElement.querySelector('button').className).toContain('tw:w-12');
  });

  it('should apply outlined border', async () => {
    const fixture = await render({ variant: 'outlined' });
    expect(fixture.nativeElement.querySelector('button').className).toContain(
      'tw:border-[var(--color-grey-88)]',
    );
  });

  it('should not emit when disabled', async () => {
    const fixture = await render({ disabled: true });
    let clicks = 0;
    fixture.componentInstance.clicked.subscribe(() => {
      clicks += 1;
    });
    fixture.nativeElement.querySelector('button').click();
    expect(clicks).toBe(0);
  });
});
