"use strict";

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_CLIENT_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS,
} = process.env;

const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_CLIENT_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
);

const sendEmail = (to, url, txt) => {
  oauth2Client.setCredentials({
    refresh_token: MAILING_SERVICE_CLIENT_REFRESH_TOKEN,
  });

  const accessToken = oauth2Client.getAccessToken();
  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "e9925ef364eaa5",
      pass: "dd6602143e2963",
    },
  });
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAUTH2",
      user: SENDER_EMAIL_ADDRESS,
      clientId: MAILING_SERVICE_CLIENT_ID,
      clientSecret: MAILING_SERVICE_CLIENT_SECRET,
      refreshToken: MAILING_SERVICE_CLIENT_REFRESH_TOKEN,
      accessToken,
    },
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL_ADDRESS,
    to: to,
    subject: "Eventos Fernandes",
    html: `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase;color: teal;">Bem-Vindo Evento Fernandes.</h2>
        <p>Parabéns! Falta pouco para usares o EVENTOS✮FERNANDES.
           Click abaixo para activar.
        </p>
        
        <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
    
        <p>Se não funcionar clique no botão abaixo</p>
    
        <div>${url}</div>
        </div>
        
        `,
  };

  smtpTransport.sendMail(mailOptions, (err, infor) => {
    if (err) {
      console.log("erro");

      console.log(err.message);
      return err;
    }
    console.log(infor);

    return infor;
  });
};

module.exports = sendEmail;
