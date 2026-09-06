import { vi } from 'vitest';

const { bootstrapApplicationMock } = vi.hoisted(() => ({
  bootstrapApplicationMock: vi.fn(),
}));

vi.mock('@angular/platform-browser', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@angular/platform-browser')>()),
  bootstrapApplication: bootstrapApplicationMock,
}));

describe('application bootstrap', () => {
  it('bootstraps the root component with the application config and reports failures', async () => {
    const bootstrapError = new Error('bootstrap failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    bootstrapApplicationMock.mockRejectedValue(bootstrapError);

    const [{ App }, { appConfig }] = await Promise.all([
      import('./app/app.component'),
      import('./app/app.config'),
      import('./main'),
    ]);

    await vi.waitFor(() => expect(consoleError).toHaveBeenCalledWith(bootstrapError));
    expect(bootstrapApplicationMock).toHaveBeenCalledWith(App, appConfig);
    consoleError.mockRestore();
  });
});
