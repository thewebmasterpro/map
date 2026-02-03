# Admin Dashboard Documentation

## Overview

The Admin Dashboard provides real-time monitoring and statistics for the Map Service microservice. It allows administrators to track API usage, monitor performance, view client activity, and identify issues.

---

## Features

### 1. Authentication

- JWT-based admin authentication
- Secure login with email/password
- 24-hour session expiry
- Automatic logout on session expiration

### 2. Statistics Dashboard

- **Summary Cards**: Quick overview of key metrics
  - Total API calls
  - Total optimizations with success rate
  - Active clients count
  - Average response and processing times

- **Usage Chart**: Visual representation of API usage over the last 30 days
  - Bar chart showing calls per day
  - Total, max, and average statistics

- **Client Statistics Table**: Per-client usage breakdown
  - Client ID
  - Total API calls
  - Number of optimizations
  - Percentage of total usage
  - Visual progress bars

- **Activity Logs**: Recent errors and issues
  - Error type (client_error or server_error)
  - Client ID
  - Endpoint and method
  - HTTP status code
  - Timestamp

### 3. Auto-Refresh

- Dashboard automatically refreshes every 30 seconds
- Manual refresh button available
- Real-time monitoring without page reload

---

## Setup & Configuration

### 1. Environment Variables

Add the following to your [.env.production](.env.production.example):

```bash
# Admin Dashboard Credentials
ADMIN_EMAIL=admin@hagendigital.com
ADMIN_PASSWORD=CHANGE-THIS-SECURE-ADMIN-PASSWORD
```

**Security Notes:**

- Use a strong password (min 16 characters, mix of letters/numbers/symbols)
- Never commit credentials to git
- Rotate password regularly
- Use environment-specific credentials

### 2. JWT Secret

Ensure `JWT_SECRET` is configured in [.env.production](.env.production.example):

```bash
JWT_SECRET=CHANGE-THIS-TO-SECURE-JWT-SECRET-MIN-32-CHARS
```

Generate a secure secret:

```bash
openssl rand -base64 48
```

---

## Access

### URLs

- **Production**: `https://map.hagendigital.com/admin/login`
- **Development**: `http://localhost:8080/admin/login`

### Login Flow

1. Navigate to `/admin/login`
2. Enter admin email and password
3. Click "Sign in"
4. On success, redirected to `/admin/dashboard`
5. Token stored in localStorage for 24 hours

---

## API Endpoints

All admin endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### POST /admin/login

Login and receive JWT token.

**Request:**

```json
{
  "email": "admin@hagendigital.com",
  "password": "your-password"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### GET /admin/summary

Get summary statistics.

**Response:**

```json
{
  "totalApiCalls": 15234,
  "totalOptimizations": 8921,
  "successRate": "98.5",
  "averageProcessingTime": 245,
  "averageResponseTime": 123,
  "activeClients": 3,
  "totalErrors": 45,
  "errorRate": "0.3"
}
```

### GET /admin/clients

Get client statistics.

**Response:**

```json
{
  "clients": [
    {
      "clientId": "saas_infi_prod",
      "totalCalls": 8234,
      "optimizations": 4521,
      "percentage": "54.02"
    }
  ]
}
```

### GET /admin/activity?limit=50

Get recent activity logs (errors).

**Response:**

```json
{
  "activity": [
    {
      "type": "client_error",
      "details": {
        "statusCode": 400,
        "endpoint": "/api/optimize",
        "method": "POST"
      },
      "clientId": "saas_delivery_prod",
      "timestamp": "2026-02-03T10:30:45.123Z"
    }
  ]
}
```

### GET /admin/usage-over-time

Get usage data for last 30 days.

**Response:**

```json
{
  "usage": [
    { "date": "2026-01-04", "calls": 245 },
    { "date": "2026-01-05", "calls": 312 }
  ]
}
```

### GET /admin/stats

Get all statistics (full data).

**Response:**

```json
{
  "apiCalls": {
    "total": 15234,
    "byClient": { "saas_infi_prod": 8234 },
    "byEndpoint": { "POST /api/optimize": 8921 },
    "byDate": { "2026-02-03": 523 }
  },
  "optimizations": {
    /* ... */
  },
  "errors": {
    /* ... */
  },
  "performance": {
    /* ... */
  },
  "clients": {
    /* ... */
  },
  "timestamp": "2026-02-03T10:30:45.123Z"
}
```

### POST /admin/reset-stats

Reset all statistics (dangerous operation).

**Response:**

```json
{
  "success": true,
  "message": "Statistics reset successfully"
}
```

---

## Statistics Tracking

The gateway automatically tracks statistics for all API requests using the [statisticsTracker](gateway/src/middleware/statisticsTracker.js) middleware.

### What is Tracked

1. **API Calls**
   - Total calls
   - Calls per client
   - Calls per endpoint
   - Calls per date

2. **Optimizations**
   - Total optimizations
   - Success/failure count
   - Processing times (last 100)
   - Average processing time

3. **Errors**
   - Total errors
   - Errors by type
   - Recent errors (last 50)

4. **Performance**
   - Response times (last 100)
   - Average response time
   - Slowest endpoints

5. **Clients**
   - Active client list
   - Requests per client

### Data Persistence

- Statistics stored in memory
- Auto-saved to `gateway/data/statistics.json` every 5 minutes
- Loaded on server restart

**Production Recommendation**: For high-traffic production environments, consider migrating to Redis or a database for better persistence and scalability.

---

## Architecture

### Backend Components

1. **[middleware/adminAuth.js](gateway/src/middleware/adminAuth.js)**
   - JWT authentication
   - Admin role validation
   - Login endpoint

2. **[middleware/statisticsTracker.js](gateway/src/middleware/statisticsTracker.js)**
   - Intercepts all requests
   - Records metrics automatically
   - Tracks response times

3. **[services/statistics.js](gateway/src/services/statistics.js)**
   - In-memory statistics store
   - Aggregation functions
   - Data persistence

4. **[routes/admin.js](gateway/src/routes/admin.js)**
   - Admin API endpoints
   - Protected routes
   - Statistics retrieval

### Frontend Components

1. **[pages/AdminLogin.tsx](frontend/src/pages/AdminLogin.tsx)**
   - Login form
   - Token storage
   - Error handling

2. **[pages/AdminDashboard.tsx](frontend/src/pages/AdminDashboard.tsx)**
   - Main dashboard layout
   - Data fetching
   - Auto-refresh
   - Logout functionality

3. **[components/admin/StatsCard.tsx](frontend/src/components/admin/StatsCard.tsx)**
   - Metric display cards
   - Color-coded icons

4. **[components/admin/ClientsTable.tsx](frontend/src/components/admin/ClientsTable.tsx)**
   - Client usage table
   - Progress bars

5. **[components/admin/ActivityTable.tsx](frontend/src/components/admin/ActivityTable.tsx)**
   - Activity/error logs
   - Formatted timestamps

6. **[components/admin/UsageChart.tsx](frontend/src/components/admin/UsageChart.tsx)**
   - SVG bar chart
   - 30-day usage visualization

7. **[services/adminApi.ts](frontend/src/services/adminApi.ts)**
   - API client
   - Token management
   - Type definitions

---

## Security Considerations

### Authentication

- ✅ JWT tokens with 24-hour expiry
- ✅ Secure password storage (environment variables)
- ✅ HTTPS required in production
- ✅ Token stored in localStorage (consider httpOnly cookies for enhanced security)

### Authorization

- ✅ Admin role validation
- ✅ Protected routes
- ✅ Token verification on every request

### Best Practices

1. **Credentials**
   - Never commit admin password
   - Use strong passwords (16+ characters)
   - Rotate credentials regularly
   - Different credentials per environment

2. **Network**
   - Always use HTTPS in production
   - Configure CORS properly
   - Use firewall rules to restrict admin access

3. **Logging**
   - All admin logins logged
   - Failed login attempts tracked
   - Suspicious activity monitored

4. **Session Management**
   - 24-hour token expiry
   - Auto-logout on expiration
   - Manual logout clears token

---

## Monitoring & Alerts

### Current Monitoring

The dashboard provides:

- Real-time statistics
- Error tracking
- Performance metrics
- Client usage patterns

### Recommended Enhancements

For production, consider adding:

1. **Alerting**
   - Email/Slack alerts for:
     - Error rate > 5%
     - Response time > 1000ms
     - Failed optimizations > 10%

2. **Advanced Monitoring**
   - Prometheus metrics export
   - Grafana dashboards
   - Sentry error tracking

3. **Logging**
   - Centralized logging (ELK stack)
   - Log aggregation
   - Search and filtering

---

## Troubleshooting

### Cannot Login

**Issue**: "Invalid credentials" error

**Solutions**:

1. Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.production`
2. Ensure JWT_SECRET is configured
3. Check gateway logs for authentication errors
4. Restart gateway after environment changes

### Dashboard Not Loading Data

**Issue**: "Failed to fetch" errors

**Solutions**:

1. Check gateway is running: `docker ps`
2. Verify CORS configuration includes frontend URL
3. Check browser console for errors
4. Ensure API_URL is correct in frontend `.env`
5. Verify JWT token is valid (not expired)

### Session Expired Quickly

**Issue**: Logged out after short time

**Solutions**:

1. Check system clock is accurate
2. Verify JWT_SECRET hasn't changed
3. Check token expiry setting (default 24h)
4. Clear localStorage and re-login

### Statistics Not Updating

**Issue**: Old data displayed

**Solutions**:

1. Check statistics middleware is active
2. Verify auto-refresh is working (30s interval)
3. Manually click "Refresh" button
4. Check gateway logs for errors
5. Verify `statisticsTracker` middleware is mounted

---

## Development

### Running Locally

1. **Start Gateway**:

   ```bash
   cd gateway
   npm run dev
   ```

2. **Start Frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Dashboard**:
   - Navigate to `http://localhost:5173/admin/login`
   - Use credentials from `.env`

### Testing

```bash
# Gateway tests
cd gateway
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Build Docker images
docker-compose -f docker-compose.prod.yml build
```

---

## Future Enhancements

### Short Term

- [ ] Export statistics to CSV/JSON
- [ ] Date range filtering
- [ ] Real-time WebSocket updates
- [ ] More detailed charts (breakdown by client)

### Medium Term

- [ ] User management (multiple admin users)
- [ ] Role-based access control
- [ ] Audit log for admin actions
- [ ] Email reports

### Long Term

- [ ] AI-powered anomaly detection
- [ ] Predictive analytics
- [ ] Custom dashboard builder
- [ ] Mobile app

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review gateway logs: `docker logs hagen-gateway`
3. Check browser console for frontend errors
4. Open an issue on GitHub

---

## Changelog

### Version 1.0.0 (2026-02-03)

- ✅ Initial release
- ✅ JWT authentication
- ✅ Summary statistics
- ✅ Client usage tracking
- ✅ Activity logs
- ✅ Usage charts
- ✅ Auto-refresh (30s)
- ✅ In-memory statistics with file persistence
