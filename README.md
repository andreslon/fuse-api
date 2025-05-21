# Fuse API

A modern, scalable NestJS-based backend API with a modular architecture and best practices.

## 🚀 Features

- Modular architecture with clear separation of concerns
- Environment configuration with validation
- Structured logging with Pino
- Redis caching
- Message queue with Pulsar
- Email service with SendGrid
- Global exception handling
- Shared utilities and DTOs

## 📋 Prerequisites

- Node.js (v18 or higher)
- Redis
- Pulsar
- SendGrid API Key

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/andreslon/fuse-api.git
cd fuse-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# App
NODE_ENV=development
PORT=3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Pulsar
PULSAR_URL=pulsar://localhost:6650

# SendGrid
SENDGRID_API_KEY=your_api_key
```

## 🏃‍♂️ Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📁 Project Structure

```
src/
├── config/           # Configuration and environment variables
├── core/            # Core modules (logger, cache, queue, etc.)
├── modules/         # Feature modules
└── shared/          # Shared resources (DTOs, interfaces, utils)
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
