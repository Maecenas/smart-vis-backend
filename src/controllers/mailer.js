/* eslint-disable no-shadow,no-console,max-len */
'use strict';

const nodemailer = require('nodemailer');
const { mail } = require('../../config');

let mailer = {
  initialize: () => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    (() => {
      if (!mail.PASSWORD) {
        return nodemailer.createTestAccount()
          .then(account => ({ user: mail.USER, pass: mail.PASSWORD } = account));
      }
      return Promise.resolve();
    })()
      .then(() => {
        const transporter = nodemailer.createTransport({
          host: mail.HOST,
          port: mail.PORT,
          secure: mail.SECURE,
          auth: {
            user: mail.USER,
            pass: mail.PASSWORD
          }
        });
        const mailOptions = {
          from: `"${mail.USERNAME}" <${mail.USER}>`
        };
        mailer.sendAuth = async function ({ mail, code }) {
          let options = {
            ...mailOptions,
            to: mail,
            subject: 'Confirm Your Account on SmartVis',
            html: `Your verification code on SmartVis is <b>${code}</b>. This will expire in 10 minutes.`
          };
          try {
            let info = await transporter.sendMail(options);
            console.log(`Message <${code}> sent to <${mail}>: ${info.messageId}`);
            return info.response;
          } catch (err) {
            throw err;
          }
        };
      });
  }
};

module.exports = mailer;
