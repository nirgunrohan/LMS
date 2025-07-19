import nodemailer from 'nodemailer'

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER!)

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  })
}
