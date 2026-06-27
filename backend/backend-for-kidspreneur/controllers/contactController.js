import { sendMail } from '../config/mailer.js';

// @desc    Handle contact form submissions
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
	const { name, email, phone, message } = req.body || {};
	if (!name || !email || !message) {
		return res.status(400).json({ message: 'Please provide name, email, and message' });
	}

	try {
		const to = process.env.CONTACT_TO_EMAIL || process.env.MAIL_FROM || process.env.SMTP_USER;
		if (!to) {
			return res.status(500).json({ message: 'Contact email is not configured on the server' });
		}

		const subject = 'New Contact Form Submission - Kidpreneur';
		const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`;
		const html = `<h2>New Contact Form Submission</h2>
		  <p><strong>Name:</strong> ${name}</p>
		  <p><strong>Email:</strong> ${email}</p>
		  <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
		  <p><strong>Message:</strong></p>
		  <p>${(message || '').replace(/\n/g, '<br/>')}</p>`;

		await sendMail({ to, subject, text, html });
		return res.json({ message: 'Your message has been sent. We will get back to you soon!' });
	} catch (err) {
		console.error('Contact form send error:', err);
		return res.status(500).json({ message: 'Failed to send your message. Please try again later.' });
	}
};

export { submitContactForm };


