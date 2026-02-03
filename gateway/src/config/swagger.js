import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hagen Logistics API',
      version: '1.0.0',
      description: `
# Hagen Logistics Platform API

RESTful API for managing logistics operations including task management, staff assignment, and route optimization.

## Authentication

All API endpoints (except \`/health\`) require authentication using an API key.

Pass your API key in the \`x-api-key\` header:

\`\`\`
x-api-key: your-api-key-here
\`\`\`

## Rate Limiting

API requests are rate-limited based on your IP address:

- **General API**: 100 requests per 15 minutes
- **Optimization**: 10 requests per 15 minutes
- **Resource Creation**: 30 requests per 15 minutes

Rate limit information is returned in response headers:
- \`RateLimit-Limit\`: Maximum requests allowed
- \`RateLimit-Remaining\`: Requests remaining
- \`RateLimit-Reset\`: Time until rate limit resets

## Error Responses

The API uses standard HTTP status codes and returns errors in JSON format:

\`\`\`json
{
  "error": "Error message describing what went wrong",
  "details": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
\`\`\`

Common status codes:
- \`200\`: Success
- \`201\`: Resource created successfully
- \`400\`: Bad request (validation error)
- \`401\`: Unauthorized (missing or invalid API key)
- \`403\`: Forbidden (valid key but insufficient permissions)
- \`404\`: Resource not found
- \`429\`: Too many requests (rate limit exceeded)
- \`500\`: Internal server error
      `,
      contact: {
        name: 'Hagen Digital',
        email: 'admin@hagendigital.com',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://map.hagendigital.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication',
        },
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'abc123def456789' },
            type: {
              type: 'string',
              enum: ['service', 'delivery'],
              description: 'Type of task',
            },
            status: {
              type: 'string',
              enum: ['pending', 'optimized', 'assigned', 'in_progress', 'completed', 'cancelled'],
              description: 'Current status of the task',
            },
            address: { type: 'string', example: '123 Main Street, City' },
            latitude: { type: 'number', format: 'double', example: 45.5017 },
            longitude: { type: 'number', format: 'double', example: -73.5673 },
            customer_name: { type: 'string', example: 'John Doe' },
            customer_phone: { type: 'string', example: '+1-234-567-8900' },
            notes: { type: 'string', example: 'Ring doorbell twice' },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium',
            },
            service_duration: {
              type: 'number',
              description: 'Service duration in minutes',
              example: 30,
            },
            staff_id: { type: 'string', nullable: true, example: 'xyz789abc123def' },
            sort_order: { type: 'number', nullable: true, example: 1 },
            created: { type: 'string', format: 'date-time' },
            updated: { type: 'string', format: 'date-time' },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['type', 'address', 'latitude', 'longitude'],
          properties: {
            type: { type: 'string', enum: ['service', 'delivery'] },
            address: { type: 'string', minLength: 1, maxLength: 500 },
            latitude: { type: 'number', minimum: -90, maximum: 90 },
            longitude: { type: 'number', minimum: -180, maximum: 180 },
            customer_name: { type: 'string', minLength: 1, maxLength: 200 },
            customer_phone: { type: 'string', maxLength: 50 },
            notes: { type: 'string', maxLength: 1000 },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
            service_duration: { type: 'number', minimum: 0, maximum: 480 },
            pickup_address: { type: 'string', maxLength: 500 },
            pickup_latitude: { type: 'number', minimum: -90, maximum: 90 },
            pickup_longitude: { type: 'number', minimum: -180, maximum: 180 },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'optimized', 'assigned', 'in_progress', 'completed', 'cancelled'],
            },
            staff_id: { type: 'string' },
            sort_order: { type: 'number', minimum: 0 },
            notes: { type: 'string', maxLength: 1000 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'field_name' },
                  message: { type: 'string', example: 'Validation error message' },
                },
              },
            },
            requestId: { type: 'string', example: 'req-12345' },
          },
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
