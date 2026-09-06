import { NAV_ITEMS } from './nav-items';

describe('NAV_ITEMS', () => {
  it('provides one labelled icon entry for every primary route', () => {
    expect(NAV_ITEMS.map(({ path }) => path)).toEqual([
      '/dashboard',
      '/tasks',
      '/calendar',
      '/analytics',
      '/team',
      '/settings',
    ]);
    expect(NAV_ITEMS.every(({ label, icon }) => label.length > 0 && icon.length > 0)).toBe(true);
  });
});
