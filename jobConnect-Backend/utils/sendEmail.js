import { getTransporter } from "../config/mail.js";

/**
 * Non-blocking email dispatch utility
 * If mail credentials are not configured, logs to console in development rather than failing
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(
        `[EMAIL NOTICE - SMTP Not Configured] To: ${to} | Subject: "${subject}"`
      );
      return { sent: false, reason: "SMTP credentials not configured" };
    }

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
    });

    console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed sending to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
};

export default sendEmail;
