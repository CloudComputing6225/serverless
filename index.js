import mailgun from 'mailgun-js';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import 'dotenv/config';


const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function handler(event) {
  const message = JSON.parse(event.Records[0].Sns.Message);
  const { userId, email, firstName } = message;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Generate verification token
    const token = crypto.randomBytes(20).toString('hex');
    const expirationTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Store token in database
    await connection.execute(
      'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
      [token, expirationTime, userId]
    );

    // Send verification email
    const verificationLink = `https://your-api-domain.com/v2/verify?token=${token}`;
    const data = {
      from: 'noreply@saurabhprojects.me',
      to: email,
      subject: 'Verify Your Email',
      text: `Hello ${firstName},\n\nPlease verify your email by clicking this link: ${verificationLink}\nThis link will expire in 2 minutes.`,
      html: `<p>Hello ${firstName},</p><p>Please verify your email by clicking this link: <a href="${verificationLink}">${verificationLink}</a></p><p>This link will expire in 2 minutes.</p>`
    };

    await new Promise((resolve, reject) => {
      mg.messages().send(data, (error, body) => {
        if (error) reject(error);
        else resolve(body);
      });
    });

    console.log(`Verification email sent to ${email}`);
    return { statusCode: 200, body: JSON.stringify({ message: 'Verification email sent' }) };
  } catch (error) {
    console.error('Error processing verification:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Error processing verification' }) };
  }
};