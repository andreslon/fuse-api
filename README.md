# Fuse API

[![Build and deploy an app to AKS](https://github.com/andreslon/fuse-api/actions/workflows/ci-cd.yaml/badge.svg?branch=dev)](https://github.com/andreslon/fuse-api/actions/workflows/ci-cd.yaml)

## Overview
Fuse API is a modern, scalable REST API built with NestJS to interact with financial data. It provides endpoints for managing stocks, portfolios, transactions, reports, and more.

## Live Deployment
- **Production URL**: [https://fuse-api.neobit.com.co](https://fuse-api.neobit.com.co)
- **API Key**: `fuse-api-key-a1b2c3d4e5f6` (required for all endpoints except `/`, `/health`, and `/health/redis`)
- **Monitoring Dashboard**: [https://monitoring.neobit.com.co/d/d3d1922e-3022-4e99-9440-f7af0a584834/fuse-api-dashboard](https://monitoring.neobit.com.co/d/d3d1922e-3022-4e99-9440-f7af0a584834/fuse-api-dashboard?orgId=1)

## Architecture Diagram

![Fuse API Architecture](https://raw.githubusercontent.com/andreslon/fuse-api/main/docs/architecture.png)

### System Architecture Overview

The Fuse API architecture follows a modern cloud-native design with multiple layers:

#### Development Layer
- **VS Code (IDE)**: Development environment where code is written and tested
- **Source Code**: Code repository containing the NestJS application
- **GitHub Actions**: CI/CD pipeline for automated testing, building and deployment

#### Infrastructure Layer
- **Container Registry**: Azure Container Registry stores Docker images of the application
- **Kubernetes**: Orchestrates the deployment of containers in Azure Kubernetes Service (AKS)
- **Virtual Network**: Secures communication between services
- **Resource Group**: Logical container for Azure resources
- **Cloudflare**: Provides DNS, SSL termination, and WAF (Web Application Firewall)
- **Certificate Authority**: Manages TLS certificates
- **Microsoft Azure**: Cloud platform hosting all services

#### Application Layer
- **Fuse-API**: The core NestJS application with x-api-key authentication
- **Service-A and Service-B**: Microservices within the Kubernetes cluster
- **Pods**: Individual containers running the application components
- **Ingress Controller**: Routes external traffic to the appropriate services
- **Secrets**: Securely stores sensitive information like API keys and passwords

#### Data Layer
- **PostgreSQL**: Managed database for persistent storage of transactions and user data
- **Cache**: Redis instance for fast data retrieval and caching of stock information
- **Apache Pulsar**: Message broker for event-driven architecture

#### Integration Layer
- **Sendgrid (Emails)**: Service for sending daily report emails
- **Fuse Finance API**: External API providing stock data
- **Monitoring Stack**: Grafana, Loki, and Prometheus for observability

### Data Flow
1. Client devices connect to Fuse API through Cloudflare with x-api-key authentication
2. Requests are routed to the appropriate service via the Ingress Controller in Kubernetes
3. The Fuse API services process requests, accessing:
   - PostgreSQL for persistent data
   - Redis for cached responses
   - Apache Pulsar for event publishing
4. External integrations include:
   - Retrieving stock data from Fuse Finance API
   - Sending emails through Sendgrid
5. Monitoring is provided via Grafana dashboards

### CI/CD Pipeline
The deployment process follows these steps:
1. Code is written in VS Code and pushed to source control
2. GitHub Actions trigger automated builds
3. Docker images are built and pushed to Azure Container Registry
4. Kubernetes pulls the images and deploys the updated services
5. Secrets are securely managed throughout the process

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Redis (for caching)
- PostgreSQL (for database)

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-repo/fuse-api.git
cd fuse-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
# Environment
NODE_ENV=development

# Server configuration
PORT=3000

# Vendor API configuration
VENDOR_API_BASE_URL=https://api.challenge.fusefinance.com
VENDOR_API_KEY=nSbPbFJfe95BFZufiDwF32UhqZLEVQ5K4wdtJI2e

# Email configuration
SENDGRID_API_KEY=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
SENDER_EMAIL=andres.londono@neobit.com.co
REPORT_RECIPIENT_EMAIL=andres.londono@neobit.com.co

# Scheduler configuration
CRON_REPORT_EXPRESSION=0 12 * * *

# Cache configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_CACHE_TTL=300000  # 5 minutes in milliseconds

# Message broker configuration
PULSAR_URL=pulsar://localhost:6650

# Database configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=fuse_db
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

4. Run the application:
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
- http://localhost:3000/ (when running locally)

### Authentication

All endpoints (except `/`, `/health`, and `/health/redis`) require an API key:

```
x-api-key: fuse-api-key-a1b2c3d4e5f6
```

### Example API Requests

#### Get API Info (No API Key Required)
```bash
curl -X GET http://localhost:3000/
```

#### Health Check (No API Key Required)
```bash
curl -X GET http://localhost:3000/api/v1/health
```

#### Main Workflow

1. List Available Stocks
```bash
curl -X 'GET' \
  'http://localhost:3000/api/v1/stocks' \
  -H 'accept: */*' \
  -H 'x-api-key: fuse-api-key-a1b2c3d4e5f6'
```

2. Execute Stock Purchase Transactions
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/transactions/buy' \
  -H 'accept: application/json' \
  -H 'x-api-key: fuse-api-key-a1b2c3d4e5f6' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "H24G1",
  "symbol": "NVDA",
  "quantity": 3,
  "price": 0.25
}'
```

3. Get User Portfolio (List of Their Stocks and Quantities)
```bash
curl -X 'GET' \
  'http://localhost:3000/api/v1/portfolio/H24G1' \
  -H 'accept: application/json' \
  -H 'x-api-key: fuse-api-key-a1b2c3d4e5f6'
```

4. Generate and Send Report by Email
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/reports/send' \
  -H 'accept: application/json' \
  -H 'x-api-key: fuse-api-key-a1b2c3d4e5f6' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "H24G1",
  "email": "user@example.com",
  "includeTransactions": true,
  "includePortfolio": true
}'
```

## Project Architecture

### Folder Structure
```
fuse-api/
├── dist/                  # Compiled JavaScript files
├── node_modules/          # Dependencies
├── src/
│   ├── core/              # Core functionality
│   │   ├── cache/         # Redis cache implementation
│   │   ├── database/      # Database connection and repositories
│   │   ├── exceptions/    # Custom exceptions and handlers
│   │   ├── guards/        # Authentication guards (API Key)
│   │   ├── logger/        # Logging service
│   │   ├── messaging/     # Message broker integration
│   │   ├── middleware/    # HTTP middleware
│   │   ├── queue/         # Background task processing
│   │   └── resilience/    # Circuit breakers and retry mechanisms
│   ├── modules/           # Feature modules
│   │   ├── health/        # Health check endpoints
│   │   ├── portfolio/     # Portfolio management
│   │   ├── reports/       # Report generation
│   │   ├── stocks/        # Stock data
│   │   ├── transactions/  # Transaction processing
│   │   ├── users/         # User management
│   │   └── vendor/        # Integration with external vendor API
│   ├── shared/            # Shared resources
│   │   ├── constants/     # Global constants
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── interfaces/    # TypeScript interfaces
│   │   ├── pagination/    # Pagination utilities
│   │   └── utils/         # Helper functions
│   ├── config/            # Configuration modules
│   ├── app.controller.ts  # Main application controller
│   ├── app.module.ts      # Main application module
│   ├── app.service.ts     # Main application service
│   └── main.ts            # Application entry point
├── test/                  # Test files
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # npm package configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

### Design Patterns and Architecture

Fuse API follows a modular architecture based on NestJS framework principles:

1. **Modular Design**: Each feature is encapsulated in its own module
2. **Dependency Injection**: Services and components are injected where needed
3. **Repository Pattern**: Data access is abstracted through repositories
4. **DTO Pattern**: Data Transfer Objects for validating request/response data
5. **Decorator Pattern**: Used extensively for route and metadata definition
6. **Middleware Pattern**: For request processing and cross-cutting concerns
7. **Factory Pattern**: For creating services and connected instances

### Key Technical Features

1. **API Authentication**: Secure API key-based authentication
2. **Data Caching**: Redis-based caching to improve performance
3. **Background Processing**: Queue system for handling long-running tasks
4. **Automated Reporting**: Scheduled report generation and email delivery
5. **Database Integration**: PostgreSQL for persistent data storage
6. **Resilience**: Circuit breakers and retry mechanisms for external API calls
7. **Logging**: Comprehensive logging system
8. **Monitoring**: Integration with monitoring tools
9. **Swagger Documentation**: Auto-generated API documentation
10. **Validation**: Request validation using class-validator

### Connected Platforms

- **Vendor API**: External financial data source
- **SendGrid**: Email delivery service
- **Redis**: Caching layer
- **PostgreSQL**: Main database
- **Azure**: Cloud hosting platform
- **Monitoring Dashboard**: Performance monitoring

## Development Guidelines

### Adding New Endpoints

1. Create a new module using NestJS CLI:
```bash
npx nest g module modules/new-feature
npx nest g controller modules/new-feature
npx nest g service modules/new-feature
```

2. Implement the controller, service, and any required DTOs and entities

3. Add the module to the imports array in `app.module.ts`
 
### Building for Production

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or support, please contact: andres.londono@neobit.com.co