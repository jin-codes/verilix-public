import nodemailer, { type Transporter } from 'nodemailer'

let transporter: Transporter | null = null

// 발신 계정은 공개 레포에 남기지 않도록 환경변수로 받는다
function getGmailUser(): string {
  const user = process.env.GMAIL_USER
  if (!user) throw new Error('GMAIL_USER is not set')
  return user
}

function getTransporter(): Transporter {
  if (!transporter) {
    const appPassword = process.env.GMAIL_APP_PASSWORD
    if (!appPassword) throw new Error('GMAIL_APP_PASSWORD is not set')
    const user = getGmailUser()
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: appPassword },
    })
  }
  return transporter
}

export async function sendDigestEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  const transport = getTransporter()
  await transport.sendMail({
    from: `verilix <${getGmailUser()}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
}
