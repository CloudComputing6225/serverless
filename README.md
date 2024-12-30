# Serverless Email Verification Service

## Overview
This serverless application provides email verification functionality for new user registrations using AWS Lambda, SNS, and Mailgun integration. The service receives user registration events via SNS, generates verification links, and sends verification emails using Mailgun.

## Architecture

### AWS Services Used
- AWS Lambda
- Amazon SNS
- AWS Secrets Manager
- AWS KMS
- CloudWatch Logs

### External Services
- Mailgun for email delivery

## Function Flow
1. Receives SNS notification when new user registers
2. Retrieves Mailgun API key from AWS Secrets Manager
3. Generates time-limited verification link
4. Sends verification email via Mailgun
5. Logs operation status to CloudWatch

## Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18.x or later
- Mailgun account and configured domain
- AWS Secrets Manager configured with Mailgun API key

## Setup

### Environment Variables
```bash
MAILGUN_API_KEY=your-secrets-manager-secret-name
```

### Dependencies
```json
{
  "dependencies": {
    "mailgun-js": "^0.22.0",
    "aws-sdk": "^2.1001.0"
  }
}
```

### Installation
1. Clone the repository
```bash
git clone git@github.com:your-org/serverless.git
cd serverless
```

2. Install dependencies
```bash
npm install
```

3. Package the function
```bash
zip -r function.zip index.js node_modules package.json
```

## Deployment
The function is deployed using Terraform as part of the infrastructure setup. Refer to the infrastructure repository for deployment details.

## Function Configuration

### Handler Function
The main handler (`handler`) processes SNS events and sends verification emails:
```javascript
export const handler = async (event) => {
  // Processes SNS event
  // Sends verification email
  // Returns response
}
```

### Email Template
The function sends both text and HTML versions of the verification email:
```javascript
const data = {
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Verify Your Email',
  text: `Hello ${firstName},...`,
  html: `<p>Hello ${firstName},...</p>`
}
```

## Security

### Secret Management
- Mailgun API key stored in AWS Secrets Manager
- KMS encryption for secrets
- IAM role with least privilege access

### Error Handling
- Comprehensive error logging
- Error responses for failed operations
- Secure error messages

## Monitoring

### CloudWatch Logs
The function logs important events:
- Function invocations
- Email sending status
- Error details
- API key retrieval status

### Metrics
Monitor using CloudWatch metrics:
- Invocation count
- Error count
- Duration
- Success rate

## Testing

### Local Testing
1. Set up environment variables
```bash
export MAILGUN_API_KEY=your-secret-name
```

2. Run test script
```bash
npm test
```

### Test Event
Example SNS event for testing:
```json
{
  "Records": [{
    "Sns": {
      "Message": "{\"userId\":\"123\",\"email\":\"test@example.com\",\"firstName\":\"John\",\"verificationToken\":\"abc123\"}"
    }
  }]
}
```

## Troubleshooting

### Common Issues
1. Secret Access Issues
   - Verify IAM role permissions
   - Check secret name in environment variables
   - Validate KMS key access

2. Email Sending Failures
   - Verify Mailgun API key
   - Check domain configuration
   - Validate email format

3. SNS Integration Issues
   - Check SNS topic subscription
   - Verify message format
   - Review IAM permissions

## IAM Role Requirements

The Lambda function requires these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": ["arn:aws:secretsmanager:*:*:secret:*"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Performance

### Optimization
- Cold start optimization
- Efficient secret caching
- Error retry handling

### Limits
- Execution timeout: 30 seconds
- Memory allocation: 128 MB
- Concurrent executions: Based on account limits

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Submit pull request
5. Ensure tests pass

## Development Guidelines

1. Code Style
   - Use ES6+ features
   - Implement async/await
   - Add comprehensive logging
   - Include error handling

2. Testing
   - Unit tests for functions
   - Integration tests for AWS services
   - Local testing setup

## License
This project is proprietary and confidential.