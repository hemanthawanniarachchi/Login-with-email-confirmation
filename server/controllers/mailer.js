import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';


let nodeConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "shannon.cartwright@ethereal.email", // generated ethereal user
      pass: "K9ddp2NC12NZRxR8dd", // generated ethereal password
    }
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme:"default",
    product:{
        name:"Mailgen",
        link:"https://mailgen.js"
    }
})

const registerMail = async (req,res)=>{
    const {username, userEmail, text, subject} = req.body;

    //email body
    var email = {
        body:{
            name:username,
            intro : text || 'Welcome to Daily GPA Calculator! We\'re very excited to have you on board.',
            outro: 'This is a generated mail. Please do not reply to this.'       
         }
    }
    var emailBody = MailGenerator.generate(email);

    let message = {
        from: "shannon.cartwright@ethereal.email",
        to: userEmail,
        subject: subject || "subject",
        html: emailBody
    }

    //send mail
    transporter.sendMail(message)
    .then(()=>{
        return res.status(200).send({msg: "You should recieved an email from us"})
    })
    .catch(error=>res.status(500).send({error}))
}


export default registerMail;