const path = require('path')
const readFile = promisify(fs.readFile)
require("dotenv").config()
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASS,
  },
});

export const sendEmail = async (to, subject , template, context)=>{
    try {
        const templatePath = path.join(__dirname, '..', 'views', `${template}.hbs`)

        const source = await readFile(templatePath, 'utf-8')

        const compiledTemplate = handlebars.compile(source)

        const html = compiledTemplate(context)

        const info = await transporter.sendMail({
            from : "",
            to:to,
            subject:subject,
            html:html,
        })
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
        
    }
}
