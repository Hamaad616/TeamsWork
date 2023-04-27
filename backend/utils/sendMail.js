const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path')

const sendMail = async (options) => {

    const __dirname = path.resolve();
    console.log(__dirname)
    const filePath = path.join(__dirname, 'backend/emails/account-activation.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      email: options.email,
      activationUrl: options.activationUrl
    };
    const htmlToSend = template(replacements);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth:{
            user: process.env.SMTP_USER,
            pass:process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject:options.subject,
        text:options.text,
        body:options.body,
        html: htmlToSend
    }
    

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
