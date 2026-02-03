import { describe, it, expect, vi } from 'vitest';
import { validate, schemas, sanitizeFilter } from './validation.js';

describe('Validation Middleware', () => {
  describe('sanitizeFilter', () => {
    it('should escape double quotes', () => {
      const result = sanitizeFilter('test"value');
      expect(result).toBe('test\\"value');
    });

    it('should escape single quotes', () => {
      const result = sanitizeFilter("test'value");
      expect(result).toBe("test\\'value");
    });

    it('should escape backslashes', () => {
      const result = sanitizeFilter('test\\value');
      expect(result).toBe('test\\\\value');
    });

    it('should handle non-string values', () => {
      expect(sanitizeFilter(123)).toBe(123);
      expect(sanitizeFilter(null)).toBe(null);
      expect(sanitizeFilter(undefined)).toBe(undefined);
    });
  });

  describe('validate middleware', () => {
    it('should validate request body successfully', () => {
      const req = {
        body: {
          type: 'service',
          address: '123 Main St',
          latitude: 45.5,
          longitude: -73.5,
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      const middleware = validate({ body: schemas.createTask });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid request body', () => {
      const req = {
        body: {
          type: 'invalid-type', // Invalid enum value
          address: '', // Too short (min 1)
          // Missing required latitude and longitude
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      const middleware = validate({ body: schemas.createTask });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = res.json.mock.calls[0]?.[0];
      expect(jsonCall).toHaveProperty('error');
      expect(next).not.toHaveBeenCalled();
    });

    it('should validate query parameters', () => {
      const req = {
        query: {
          page: '1',
          perPage: '50',
          status: 'pending',
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      const middleware = validate({ query: schemas.listTasks });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.page).toBe(1); // Should be coerced to number
      expect(req.query.perPage).toBe(50);
    });
  });

  describe('schemas', () => {
    it('should validate createTask schema', () => {
      const validTask = {
        type: 'delivery',
        address: '456 Oak Ave',
        latitude: 40.7,
        longitude: -74.0,
        customer_name: 'John Doe',
      };

      const result = schemas.createTask.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      const invalidTask = {
        type: 'service',
        address: '789 Pine St',
        latitude: 91, // Invalid: > 90
        longitude: -74.0,
      };

      const result = schemas.createTask.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('should validate taskId format', () => {
      const validId = 'abc123def456789';
      const invalidId = 'invalid-id';

      expect(schemas.taskId.safeParse(validId).success).toBe(true);
      expect(schemas.taskId.safeParse(invalidId).success).toBe(false);
    });
  });
});
