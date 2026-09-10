import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers the global errors, router, and HTTP providers', () => {
    expect(appConfig.providers).toHaveLength(3);
    expect(appConfig.providers.every((provider) => provider !== undefined)).toBe(true);
  });
});
