const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3003;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'nithyaa.work@gmail.com',
        pass: 'adms yfps pihg azje'
    }
});


const users = [
    { email: 'backendwork00@gmail.com', otp: '', verified: false }
];


app.use(bodyParser.json());


app.post('/send-otp', (req, res) => {
    const { email } = req.body;


    let user = users.find(u => u.email === email);
    if (!user) {
        user = { email, otp: '', verified: false };
        users.push(user);
    }

    // Generate OTP
    user.otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });


    const mailOptions = {
        from: 'nithyaa.work@gmail.com',
        to: 'backendwork00@gmail',
        subject: 'OTP for Email Verification',
        text: `Your OTP (One-Time Password) for email verification is: ${user.otp}.`
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error sending email:', error);
            res.status(500).send('Error sending OTP.');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('OTP sent successfully.');
        }
    });
});


app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;


    const user = users.find(u => u.email === email);

    if (!user || user.otp !== otp) {
        res.status(401).send('Invalid OTP.');
    } else {

        user.verified = true;


        const token = jwt.sign({ email: user.email }, 'yourSecretKey', { expiresIn: '1h' });

        res.status(200).json({ token });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
