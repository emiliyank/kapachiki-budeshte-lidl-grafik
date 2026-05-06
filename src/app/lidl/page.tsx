import { AdminCalendar } from '@/components/admin/AdminCalendar'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function LidlPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Панел Лидл</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Управление на наличността и блокиране на дати
        </p>
      </div>

      <div className="max-w-lg">
        <AdminCalendar />
      </div>

      <div className="rounded-lg border bg-white p-4 text-sm space-y-2">
        <p className="font-medium">Как да управлявате дните:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Кликнете върху ден от календара, за да го конфигурирате</li>
          <li>Можете да блокирате ден (напр. официален празник) или да промените максималния му капацитет</li>
          <li>Цветовете показват текущото натоварване на деня</li>
        </ul>
      </div>
    </div>
  )
}
