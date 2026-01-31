import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as path from 'path';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. DynamoDB Table (Single-table design)
    const table = new dynamodb.Table(this, 'ProjectTasksTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For testing only
    });

    // 2. Hono API Lambda Function
    const apiLambda = new nodejs.NodejsFunction(this, 'ApiLambda', {
      entry: path.join(__dirname, '../../packages/api/src/index.ts'),
      handler: 'handler', // We will update index.ts to export this
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLE_NAME: table.tableName,
        NODE_ENV: 'production',
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // 3. Grant Permissions
    table.grantReadWriteData(apiLambda);

    // 4. API Gateway (HTTP)
    const httpApi = new apigw2.HttpApi(this, 'ProjectHttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigw2.CorsHttpMethod.ANY],
        allowHeaders: ['*'],
      },
    });

    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigw2.HttpMethod.ANY],
      integration: new HttpLambdaIntegration('ApiLambdaIntegration', apiLambda),
    });

    // 5. Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: httpApi.apiEndpoint,
    });
  }
}
