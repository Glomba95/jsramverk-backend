require('dotenv').config();
const { v4: uuid } = require("uuid");
const sgMail = require("@sendgrid/mail");

// Use sendgrid API key from .env file
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendInvite(sendingUser, token, toEmail) {
    const inviteLink = `http://localhost:3000?inviteToken=${token}`;
    // const inviteLink = `https://www.student.bth.se/~ebam18/editor?inviteToken=${token}`;

    const msg = {
        to: toEmail,
        from: "jsramverkeditor@gmail.com",
        subject: "Invite to collaborate on a document",
        html: `
      <h1>Document collaboration invite</h1>
      <p>You have been invited to collaborate on a document by our user ${sendingUser}.</p>
      <p><a href="${inviteLink}">Click here to register and access the document.</a></p>
      <p>Do not reply to this email.</p>
    `,
    };

    try {
        // TODO testa med ny registrering
        // await sgMail.send(msg);
        // console.log("invite sent");

        console.log(`\n\n\n --- EMAIL TEMPLATE ---\n\nInvitelink: ${inviteLink}\n\nMessage:\n- to: ${msg.to}\n- from: ${msg.from}\n- subject: ${msg.subject}\n- html: ${msg.html}`);

        return { success: true, message: "Email sent successfully." };
    } catch (e) {
        console.error(e);
        console.log("invite send error");
        console.log(e.message);
        return { success: false, message: e.message };
    }
}

module.exports = { sendInvite: sendInvite };