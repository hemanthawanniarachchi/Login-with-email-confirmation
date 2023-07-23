var nodemailer = require('nodemailer');
const dotenv = require('dotenv');

module.exports = function sendMails(to , subject , body){
    dotenv.config();
    let transporter = nodemailer.createTransport({
        host: "gmail",//'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: "",
            pass: ""
        }
    });
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: "GPA Calculator<"+process.env.EMAIL+">", // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: body, // plain text body
      //  html: '<b>Hello world?</b>' // html body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}