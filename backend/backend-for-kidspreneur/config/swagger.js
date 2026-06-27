import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kidpreneur API',
      version: '1.0.0',
      description: 'API documentation for Kidpreneur platform',
      contact: {
        name: 'Kidpreneur Support',
        email: 'support@kidpreneur.com',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    join(__dirname, '../routes/**/*.js'),
    join(__dirname, '../models/*.js'),
  ],
};

const specs = swaggerJsdoc(options);

export default specs;
