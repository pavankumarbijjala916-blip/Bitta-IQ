
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const TO_EMAIL = process.env.SENDGRID_FROM_EMAIL; // Send to self for testing

console.log('--- Email Test Script ---');
console.log('API Key:', API_KEY ? 'Set (' + API_KEY.substring(0, 5) + '...)' : 'Not Set');
console.log('From Email:', FROM_EMAIL);

if (!API_KEY) {
    console.error('❌ Error: SENDGRID_API_KEY is missing in .env');
    process.exit(1);
}

sgMail.setApiKey(API_KEY);

const msg = {
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject: 'BATT IQ Test Email',
    text: 'This is a test email from BATT IQ backend to verify SendGrid configuration.',
    html: '<strong>This is a test email from BATT IQ backend</strong> to verify SendGrid configuration.',
};

(async () => {
    try {
        await sgMail.send(msg);
        console.log('✅ Email sent successfully to', TO_EMAIL);
    } catch (error) {
        console.error('❌ Error sending email:');
        console.error(error.toString());
        if (error.response) {
            console.error(error.response.body);
        }
    }
})();
