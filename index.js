import mailgun from 'mailgun-js';
import AWS from 'aws-sdk';

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

export const handler = async (event) => {
  console.log('Lambda function invoked with event:', JSON.stringify(event));

  try {
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log('Parsed SNS message:', message);

    const { userId, email, firstName, verificationToken } = message;

    // Send verification email
    const verificationLink = `http://dev.saurabhprojects.me/v2/verify?token=${verificationToken}`;
    const data = {
      from: 'noreply@saurabhprojects.me',
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