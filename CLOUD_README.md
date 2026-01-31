# Cloud Deployment Guide - Anti-Serverless

This guide details the steps to deploy the `anti-serverless` application to AWS.

## Prerequisites

Ensure you have the following installed and configured:

1.  **Node.js**: v20 or later.
2.  **AWS CLI**: Configured with credentials (`aws configure`).
3.  **AWS CDK**: Installed globally (`npm install -g aws-cdk`) or accessible via `npx`.

## 1. Project Setup

The project is a Monorepo using `pnpm` (implied by `pnpm-lock.yaml`, though `npm` works if configured). Assuming `npm` for standard CLI usage:

```bash
# Install dependencies for all packages
npm install
```

## 2. Backend Deployment (AWS CDK)

The backend infrastructure (DynamoDB, Lambda, API Gateway) is defined in the `infra` package.

1.  Navigate to the infrastructure directory:
    ```bash
    cd infra
    ```

2.  (Optional) Bootstrap CDK if this is your first time deploying to this AWS account/region:
    ```bash
    npx cdk bootstrap
    ```

3.  Deploy the stack:
    ```bash
    npx cdk deploy
    ```
    Confirm the changes when prompted.

4.  **Important**: After successful deployment, note the **Output** value for `ApiEndpoint`. It will look something like:
    ```
    InfraStack.ApiEndpoint = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
    ```

## 3. Frontend Configuration

The web application connects to the backend API. You must update the API URL in the frontend code to point to your deployed backend.

1.  Open `packages/web/src/app/page.tsx`.
2.  Locate the `PROD_API_URL` constant.
3.  Replace the value with your **ApiEndpoint** from the CDK output (without the trailing slash if the code appends paths, currently the code uses it as a base).

    ```typescript
    // packages/web/src/app/page.tsx
    const PROD_API_URL = 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com';
    ```

## 4. Frontend Deployment

The frontend is a standard Next.js application.

### Build Locally
To build the application for production locally:

```bash
cd packages/web
npm run build
npm start
```

### Deploy to Vercel (Recommended)
1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Import the project into Vercel.
3.  Select the `packages/web` directory as the Root Directory.
4.  Vercel will automatically detect Next.js settings.
5.  Deploy.

### Deploy to AWS Amplify (Alternative)
1.  Connect your repository to AWS Amplify Console.
2.  Set the base directory to `packages/web`.
3.  Amplify will detect the Next.js build settings.
4.  Deploy.

## Troubleshooting

-   **CDK Deploy Fails**: Ensure your AWS CLI credentials are valid (`aws sts get-caller-identity`).
-   **API Errors**: Check CloudWatch Logs for the `ApiLambda` function if requests fail.
-   **CORS Issues**: The API Gateway is configured to allow all origins (`*`). If you face CORS errors, check the browser console and ensure the API URL matches exactly.
