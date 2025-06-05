# PAPA-TS Service

This project provides a simple REST API built with Express and TypeScript.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

## API Documentation

After starting the server, Swagger UI is available locally at [http://localhost:5000/api-docs](http://localhost:5000/api-docs).

When deployed, the docs can be viewed at [https://papa-ts-service-production.up.railway.app/api-docs](https://papa-ts-service-production.up.railway.app/api-docs).


The OpenAPI specification is generated using `swagger-jsdoc` from the route files in `src/routes`.
