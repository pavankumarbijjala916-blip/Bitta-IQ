const http = require('http');

const payload = JSON.stringify({
    email: 'pavankumarbijjala916@gmail.com',
    subject: '✅ TEST - BATT IQ Email Verification',
    htmlContent: `
    <html>
      <body>
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:20px;border-radius:8px;text-align:center">
            <h1>🔋 BATT IQ - Email Test</h1>
          </div>
          <div style="padding:20px">
            <p>Hi Pavan,</p>
            <p>This is a <strong>test email</strong> to verify the BATT IQ email notification system is working correctly.</p>
            <p style="color:green;font-size:18px;font-weight:bold">✅ If you received this, emails are working!</p>
            <p>The system will now send alerts for:</p>
            <ul>
              <li>✅ Battery registered as <strong>Healthy</strong></li>
              <li>⚠️ Battery registered as <strong>Repairable</strong></li>
              <li>🔴 Battery registered as <strong>Recyclable</strong></li>
            </ul>
            <p style="color:#888;font-size:12px">Sent at: ${new Date().toLocaleString()}</p>
          </div>
          <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#666;border-radius:0 0 8px 8px">
            BATT IQ – Battery Intelligence &amp; Quality System
          </div>
        </div>
      </body>
    </html>
  `,
    recipientName: 'Pavan Kumar',
    templateType: 'alert'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/notifications/email',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

console.log('📧 Sending test email to pavankumarbijjala916@gmail.com...');

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('\n=== EMAIL TEST RESULT ===');
            console.log('HTTP Status    :', res.statusCode);
            console.log('API Success    :', parsed.success);
            console.log('SendGrid Sent  :', parsed.sendgridSent);
            console.log('Logged Locally :', parsed.loggedLocally);
            console.log('Error          :', parsed.error || 'none');
            console.log('Message        :', parsed.message);
            if (parsed.sendgridSent) {
                console.log('\n🎉 EMAIL DELIVERED via SendGrid! Check your inbox.');
            } else {
                console.log('\n⚠️  Email logged locally only - SendGrid may have rejected it.');
                console.log('   Check error above for details.');
            }
        } catch (e) {
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Connection failed:', e.message);
    console.error('Make sure email-service is running: cd email-service && node server.js');
});

req.write(payload);
req.end();
