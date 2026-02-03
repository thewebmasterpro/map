# Security Policy

## Overview

This document outlines the security measures implemented in the Hagen Logistics Platform and provides guidelines for reporting security vulnerabilities.

## Implemented Security Measures

### 1. Authentication & Authorization

- **API Key Authentication**: All API endpoints (except `/health`) require a valid API key via `x-api-key` header
- **Client Verification**: API keys are validated against the `clients` collection in PocketBase
- **Origin Validation**: CORS origin checking per client to prevent unauthorized domain access
- **Resource Ownership**: All operations verify that resources belong to the authenticated client

### 2. Input Validation

- **Zod Schema Validation**: All request bodies, query parameters, and URL parameters are validated using Zod schemas
- **Type Safety**: TypeScript types ensure compile-time safety on the frontend
- **Sanitization**: Special characters in filter strings are escaped to prevent injection attacks
- **Size Limits**: Request body size limited to 100KB to prevent DoS attacks

**Validation Schemas**:

- Task creation: Type, coordinates, address, customer details
- Task updates: Status, staff assignment, notes
- Query parameters: Page numbers, filters, sorting

### 3. Rate Limiting

Multiple rate limiting tiers protect against abuse:

| Endpoint Type     | Limit   | Window | Purpose                      |
| ----------------- | ------- | ------ | ---------------------------- |
| General API       | 100 req | 15 min | Prevent API abuse            |
| Authentication    | 5 req   | 15 min | Prevent brute force          |
| Resource Creation | 30 req  | 15 min | Prevent spam                 |
| Optimization      | 10 req  | 15 min | Protect expensive operations |

Rate limit info is returned in `RateLimit-*` headers.

### 4. Security Headers

The following security headers are configured via Helmet:

- **Content-Security-Policy (CSP)**: Restricts resource loading to trusted sources
- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections (max-age: 1 year)
- **X-Frame-Options**: Prevents clickjacking (`DENY`)
- **X-Content-Type-Options**: Prevents MIME sniffing (`nosniff`)
- **Referrer-Policy**: Controls referrer information (`strict-origin-when-cross-origin`)
- **Cross-Origin-Embedder-Policy**: Prevents cross-origin resource leaks
- **Cross-Origin-Opener-Policy**: Isolates browsing context
- **Cross-Origin-Resource-Policy**: Controls cross-origin resource sharing

### 5. Error Handling

- **Sanitized Error Messages**: Stack traces and sensitive data never exposed to clients
- **Environment-Aware Logging**: Full errors logged server-side in development only
- **Generic Error Responses**: 500 errors return generic "Internal server error" message
- **Sensitive Data Filtering**: Passwords, tokens, API keys, file paths automatically redacted from error messages
- **Request ID Tracking**: Errors include request IDs for tracking (when available)

### 6. Environment Variable Security

- **Validation at Startup**: All required environment variables validated using Zod
- **Type Safety**: Environment variables are type-checked and immutable
- **No Hardcoded Secrets**: All sensitive data moved to environment variables
- **.gitignore Protection**: `.env` and `.env.local` files excluded from version control
- **Clear Examples**: `.env.example` shows required variables with placeholder values

**Frontend Environment Variables**:

```
VITE_API_URL          - API Gateway URL
VITE_POCKETBASE_URL   - PocketBase URL
VITE_MAP_TILE_URL     - Map tile server URL
VITE_API_KEY          - Client API key
VITE_OSRM_URL         - OSRM routing server URL (optional)
```

**Gateway Environment Variables**:

```
GATEWAY_PORT          - Server port
NODE_ENV              - Environment (development|production|test)
POCKETBASE_URL        - PocketBase database URL
JWT_SECRET            - JWT signing secret (min 32 chars)
GATEWAY_CORS_ORIGINS  - Allowed CORS origins (comma-separated)
```

### 7. CORS Configuration

- **Configurable Origins**: CORS origins specified via environment variable
- **Credential Support**: Allows credentials for authenticated requests
- **Method Restrictions**: Only GET, POST, PATCH, DELETE allowed
- **Header Whitelist**: Only necessary headers permitted

### 8. Data Protection

- **Client Isolation**: Queries filtered by `client_id` to prevent data leakage
- **Parameter Sanitization**: SQL-like filter strings sanitized to prevent injection
- **Minimal Data Exposure**: API responses exclude unnecessary internal data
- **Production Data Filtering**: Raw VROOM data only exposed in development mode

## Security Best Practices

### For Developers

1. **Never commit secrets**: Always use environment variables for sensitive data
2. **Validate all inputs**: Use Zod schemas for all user input
3. **Check ownership**: Verify resource ownership before allowing operations
4. **Log securely**: Never log sensitive data (passwords, tokens, API keys)
5. **Handle errors safely**: Use the error handler middleware, never expose stack traces
6. **Test security**: Verify authentication, authorization, and validation work correctly

### For Deployment

1. **Use strong secrets**: Generate cryptographically secure random strings for JWT_SECRET
2. **Configure CORS**: Set specific allowed origins, never use `*` in production
3. **Enable HTTPS**: Always use TLS/SSL in production
4. **Set NODE_ENV**: Ensure `NODE_ENV=production` in production environments
5. **Rotate credentials**: Regularly rotate API keys and admin passwords
6. **Monitor logs**: Review error logs for suspicious activity
7. **Keep dependencies updated**: Regularly run `npm audit` and update packages

### Environment-Specific Configuration

**Development**:

- Detailed error messages and stack traces
- Console logging enabled
- Less restrictive CORS for local testing
- Lower rate limits for testing

**Production**:

- Sanitized error messages
- Structured logging to external service
- Strict CORS configuration
- Full rate limiting enabled
- HTTPS required

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: `admin@hagendigital.com`
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We aim to respond to security reports within 48 hours.

## Security Checklist for Production

Before deploying to production, verify:

- [ ] All environment variables set with strong, unique values
- [ ] JWT_SECRET is at least 32 characters of random data
- [ ] POCKETBASE_ADMIN_PASSWORD changed from default
- [ ] GATEWAY_CORS_ORIGINS set to specific domains (not `*`)
- [ ] NODE_ENV=production
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Rate limiting configured and tested
- [ ] Error logging configured (e.g., Sentry)
- [ ] Database backups configured
- [ ] No `.env` files committed to version control
- [ ] API keys rotated from development values
- [ ] Security headers verified (use securityheaders.com)

## Recent Security Improvements (Phase 1)

**Completed on 2026-02-03**:

1. ✅ Removed all hardcoded API keys and credentials
2. ✅ Implemented comprehensive input validation with Zod
3. ✅ Added multi-tier rate limiting to all API endpoints
4. ✅ Configured security headers (CSP, HSTS, XSS protection, etc.)
5. ✅ Added environment variable validation at startup
6. ✅ Sanitized error messages to prevent information leakage

## Future Security Enhancements

Planned improvements:

- [ ] Implement JWT-based authentication for users
- [ ] Add CSRF token protection
- [ ] Implement audit logging for sensitive operations
- [ ] Add request signing for critical operations
- [ ] Implement API key rotation mechanism
- [ ] Add automated security testing (OWASP ZAP, etc.)
- [ ] Implement database encryption for sensitive fields
- [ ] Add webhook signature verification
- [ ] Implement IP whitelisting for admin operations

## Security Compliance

This application implements security measures aligned with:

- OWASP Top 10 protection
- GDPR data protection principles (when handling EU user data)
- Industry standard authentication practices
- Secure coding guidelines

## License & Disclaimer

This software is provided "as is" without warranty. Users are responsible for conducting their own security audits and implementing additional security measures appropriate for their use case.
