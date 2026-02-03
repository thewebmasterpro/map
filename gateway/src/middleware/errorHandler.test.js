import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from './errorHandler.js';

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      url: '/api/test',
      method: 'GET',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 500 for errors without status', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining('Internal server error'),
    });
  });

  it('should return custom status code if provided', () => {
    const error = new Error('Bad request');
    error.status = 400;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should sanitize error messages containing passwords', () => {
    const error = new Error('Error: password=secret123');
    error.status = 400;

    errorHandler(error, req, res, next);

    const response = res.json.mock.calls[0][0];
    expect(response.error).toContain('password=***');
    expect(response.error).not.toContain('secret123');
  });

  it('should sanitize error messages containing API keys', () => {
    const error = new Error('Invalid api_key=sk_live_12345');
    error.status = 401;

    errorHandler(error, req, res, next);

    const response = res.json.mock.calls[0][0];
    expect(response.error).toContain('api_key=***');
    expect(response.error).not.toContain('sk_live_12345');
  });

  it('should sanitize error messages containing tokens', () => {
    const error = new Error('Token expired: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    error.status = 401;

    errorHandler(error, req, res, next);

    const response = res.json.mock.calls[0][0];
    expect(response.error).toContain('token=***');
  });

  it('should hide file paths in error messages', () => {
    const error = new Error('File not found: /home/user/secrets/config.json');
    error.status = 404;

    errorHandler(error, req, res, next);

    const response = res.json.mock.calls[0][0];
    expect(response.error).toContain('[PATH]');
    expect(response.error).not.toContain('/home/user/secrets');
  });

  it('should include request ID if available', () => {
    req.id = 'req-12345';
    const error = new Error('Test error');
    error.status = 400;

    errorHandler(error, req, res, next);

    const response = res.json.mock.calls[0][0];
    expect(response.requestId).toBe('req-12345');
  });
});
