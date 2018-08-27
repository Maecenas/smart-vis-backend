'use strict';

const nodemailer = require('nodemailer');
const { mailer } = require('../../config/default');

const transporter = nodemailer.createTransport({
  host: mailer.HOST,
  port: mailer.PORT,
  secure: mailer.SECURE,
  auth: {
    user: mailer.USER,
    pass: mailer.PASSWORD
  }
});
const mailOptions = {
  from: `"${mailer.USERNAME}" <${mailer.USER}>`
};

async function sendAuth({ mail, code }) {
  let options = {
    ...mailOptions,
    to: mail,
    subject: 'Confirm Your Account on Vis',
    html: `Your verification code on Vis is <b>${code}</b>. This will expire in 10 minutes.`
  };
  try {
    let info = await transporter.sendMail(options);
    console.log('Message sent: %s', info.messageId);
    return info.response;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  sendAuth
};
