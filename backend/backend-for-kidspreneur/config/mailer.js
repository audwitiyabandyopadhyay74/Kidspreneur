import nodemailer from 'nodemailer';

// Create and export a reusable transporter using environment variables
// Expected env vars:
// - SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS
// - MAIL_FROM (default from address), CONTACT_TO_EMAIL (recipient for contact form)

let cachedTransporter = null;

function getBooleanEnv(name, defaultValue = false) {
	const value = process.env[name];
	if (value === undefined) return defaultValue;
	return String(value).toLowerCase() === 'true';
}

function createTransporter() {
	if (cachedTransporter) return cachedTransporter;

	if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
		console.warn('SMTP not fully configured. Set SMTP_HOST and SMTP_PORT to enable email sending.');
	}

	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT) || 587,
		secure: getBooleanEnv('SMTP_SECURE', false),
		auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		} : undefined,
	});

	cachedTransporter = transporter;
	return transporter;
}

async function sendMail({ to, subject, text, html, from }) {
	const transporter = createTransporter();
	const defaultFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
	return transporter.sendMail({ from: from || defaultFrom, to, subject, text, html });
}

// Export the mailer functions
export { createTransporter, sendMail };

export default { createTransporter, sendMail };


