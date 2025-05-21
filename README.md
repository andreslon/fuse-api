# Fuse API

A NestJS-based API for stock trading with clean architecture principles.

## Features

- **List available stocks** (`GET /api/v1/stocks`)
- **View user portfolio** (`GET /api/v1/portfolio/:userId`)
- **Buy stocks** (`POST /api/v1/transactions/buy`)
- **Daily email reports** with transaction summaries

## Environment Variables

Configure the application using the following environment variables:

```
# Server configuration
PORT=3000

# Vendor API configuration
VENDOR_API_BASE_URL=https://api.challenge.fusefinance.com
VENDOR_API_KEY=your_api_key_here

# Email configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDER_EMAIL=report@fuseapi.com
REPORT_RECIPIENT_EMAIL=admin@example.com

# Scheduler configuration
CRON_REPORT_EXPRESSION=0 20 * * *  # Run at 8:00 PM every day
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the required environment variables

## Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, access the Swagger documentation at:

- http://localhost:3000 (root)
- http://localhost:3000/docs (explicit path)

## Architecture

This project follows clean architecture principles:

- **Modules**: Feature-focused modules for different business domains
- **DTOs**: Clear data transfer objects for request/response handling
- **Services**: Business logic separated from controllers
- **Repository Pattern**: Abstract data access
- **Strategy Pattern**: Used for report delivery mechanisms
- **Exception Handling**: Centralized exception filters and custom exceptions

## Key Components

- **Stock Module**: List available stocks
- **Portfolio Module**: Manage user portfolios
- **Transaction Module**: Handle buy operations with price tolerance checks
- **Vendor Integration**: External API connection with resilience patterns
- **Report Module**: Generates and sends daily reports via email

## Technical Features

- **Validation**: Request validation with class-validator
- **Caching**: Redis-based caching for performance
- **Logging**: Structured logging
- **Resilience**: Circuit breakers, retries, and timeouts
- **Scheduling**: Automated tasks using cron expressions
- **Documentation**: Swagger/OpenAPI docs for API endpoints
