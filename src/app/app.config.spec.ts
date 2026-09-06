import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers the global errors, animations, router, and HTTP providers', () => {
    expect(appConfig.providers).toHaveLength(4);
    expect(appConfig.providers.every((provider) => provider !== undefined)).toBe(true);
  });
});
