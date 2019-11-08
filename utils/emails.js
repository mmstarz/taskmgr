const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async (emailAddress, name) => {
  try { 
    await sgMail.send({
      to: emailAddress,
      from: "vanilla@node.com",
      subject: "Welcome to the node.js family",
      text: `Congratulations! ${name} you have successfully joined up to the app.`,
      html: `<h3>Congratulations! ${name} you have successfully joined up to the app.</h3>`
    });
  } catch (err) {
    return err;
  }
};

const sendGoodbyeEmail = async (emailAddress, name) => {
  try {
    await sgMail.send({
      to: emailAddress,
      from: "vanilla@node.com",
      subject: "Thanks for using our service",
      text: `Goodbye ${name}, hope to see you back some time soon.`,
      html: `<h3>Goodbye ${name}, hope to see you back some time soon.</h3>`
    });
  } catch (err) {
    return err
  }
};

module.exports = { sendWelcomeEmail, sendGoodbyeEmail };
