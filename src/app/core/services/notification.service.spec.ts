import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  it('should set and clear a message', () => {
    vi.useFakeTimers();
    const service = TestBed.inject(NotificationService);
    expect(service.message()).toBeNull();
    service.show('Saved');
    expect(service.message()).toBe('Saved');
    service.show('Again');
    expect(service.message()).toBe('Again');
    vi.advanceTimersByTime(6000);
    expect(service.message()).toBeNull();
    service.show('Later');
    service.clear();
    expect(service.message()).toBeNull();
    service.clear();
    vi.useRealTimers();
  });
});
