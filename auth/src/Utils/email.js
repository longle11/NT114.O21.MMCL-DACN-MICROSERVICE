const nodemailer = require("nodemailer")
const smtpConfig = require('../Config/smtp')
const sendEmail = async(sender) => {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: smtpConfig.SMTP_HOST,
        port: smtpConfig.SMTP_PORT,
        secure: false, 
        auth: {
            user: smtpConfig.SMTP_USERNAME, 
            pass: smtpConfig.SMTP_PASSWORD, 
        },
    });

    let info = await transporter.sendMail({
        from: `${smtpConfig.FORM_NAME} ${smtpConfig.FORM_EMAIL}`, 
        to: sender.email, 
        subject: sender.subject, 
        text: sender.notify
    });
}
module.exports = sendEmail;