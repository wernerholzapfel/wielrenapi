import { JsonBodyMiddlewareMiddleware } from './json-body-middleware.middleware';

describe('JsonBodyMiddlewareMiddleware', () => {
  it('should be defined', () => {
    expect(new JsonBodyMiddlewareMiddleware()).toBeDefined();
  });
});
