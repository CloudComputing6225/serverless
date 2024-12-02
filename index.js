import mailgun from 'mailgun-js';
import AWS from 'aws-sdk';

const secretsManager = new AWS.SecretsManager();

async function getMailgunApiKey() {
  const secretName = process.env.MAILGUN_API_KEY;
  console.log('Secret Name:', secretName);
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    if ('SecretString' in data) {
      const secretValue = data.SecretString;
      // Check if the secret is already a JSON object
      try {
        const secret = JSON.parse(secretValue);
        return secret.api_key;
      } catch (parseError) {
        // If parsing fails, assume the secret is the API key itself
        return secretValue;
      }
    } else if ('SecretBinary' in data) {
      // Handle binary secret (if applicable)
      const buff = Buffer.from(data.SecretBinary, 'base64');
      return buff.toString('ascii');
    } else {
      throw new Error('Secret not found in SecretString or SecretBinary');
    }
  } catch (error) {
    console.error('Error retrieving Mailgun API key:', error);
    throw error;
  }
}

export const handler = async (event) => {
  console.log('Lambda function invoked with event:', JSON.stringify(event));

  try {
    const apiKey = await getMailgunApiKey();
    const domain = 'saurabhprojects.me';

    const mg = mailgun({ apiKey, domain });
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log('Parsed SNS message:', message);

    const { userId, email, firstName, verificationToken } = message;

    const verificationLink = `https://dev.saurabhprojects.me/v2/verify?token=${verificationToken}`;
    console.log(verificationLink);
    console.log(email);
    const data = {
      from: `noreply@saurabhprojects.me`,
      to: email,
      subject: 'Verify Your Email',
      text: `Hello ${firstName},\n\nPlease verify your email by clicking this link: ${verificationLink}\nThis link will expire in 2 minutes.`,
      html: `<p>Hello ${firstName},</p><p>Please verify your email by clicking this link: <a href="${verificationLink}">${verificationLink}</a></p><p>This link will expire in 2 minutes.</p>`
    };

    await new Promise((resolve, reject) => {
      mg.messages().send(data, (error, body) => {
        if (error) {
          console.error('Error sending email:', error);
          reject(error);
        } else {
          console.log('Email sent successfully:', body);
          resolve(body);
        }
      });
    });

    console.log(`Verification email sent to ${email}`);
    return { statusCode: 200, body: JSON.stringify({ message: 'Verification email sent' }) };
  } catch (error) {
    console.error('Error processing verification:', error);
    return { statusCode: 400, body: JSON.stringify({ message: 'Error processing verification' }) };
  }
};