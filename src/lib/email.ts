import { Resend } from 'resend'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendReminderEmail(params: {
  to: string
  name: string
  date: Date
  containerSize: string
}) {
  const dateStr = format(params.date, 'dd MMMM yyyy', { locale: bg })
  return resend.emails.send({
    from: 'Капачки за Бъдеще Враца <napomnyane@kapachki-vraca.bg>',
    to: params.to,
    subject: `Напомняне: Резервация за капачки утре — ${dateStr}`,
    html: `
      <h2>Здравейте, ${params.name}!</h2>
      <p>Напомняме ви, че утре (<strong>${dateStr}</strong>) имате резервация
      да донесете капачки в контейнера на Лидл — Враца.</p>
      <p>Количество: <strong>${params.containerSize}</strong></p>
      <p>Благодарим ви, че подкрепяте инициативата!</p>
      <hr/>
      <p><small>Капачки за Бъдеще — Враца</small></p>
    `,
  })
}
