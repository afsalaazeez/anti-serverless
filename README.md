# Anti-Serverless Monorepo

A high-performance, serverless web application built with Hono, Next.js, and AWS CDK.

## Project Structure

- `infra/`: AWS CDK infrastructure (DynamoDB, Lambda, API Gateway).
- `packages/api/`: Hono API with Dependency Injection and Zod validation.
- `packages/web/`: Next.js frontend with Tailwind CSS.

## Prerequisites

- Node.js 20+
- pnpm 8+
- AWS CLI configured (for deployment)

## Getting Started

### Local Development

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Start the API**:
    ```bash
    cd packages/api
    npm run dev
    ```
    The API will be available at `http://localhost:3001`.

3.  **Start the Web app**:
    ```bash
    cd packages/web
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

### Infrastructure & Deployment

1.  **Bootstrap CDK** (if not already done):
    ```bash
    cd infra
    npx cdk bootstrap
    ```

2.  **Synthesize CloudFormation**:
    ```bash
    cd infra
    npx cdk synth
    ```

3.  **Deploy to AWS**:
    ```bash
    cd infra
    npx cdk deploy
    ```

## Architecture Notes

- **API**: Uses a Clean Architecture approach with Dependency Injection.
- **Database**: Single-table design in DynamoDB for performance and scalability.
- **Type Safety**: Strict TypeScript mode and Zod for schema validation.
- **Frontend**: Next.js App Router with Tailwind CSS for a premium UI.
