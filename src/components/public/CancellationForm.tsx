'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cancellationRequestSchema, type CancellationRequestInput } from '@/lib/validations'
import { toast } from 'sonner'

export function CancellationForm() {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CancellationRequestInput>({
    resolver: zodResolver(cancellationRequestSchema),
  })

  async function onSubmit(data: CancellationRequestInput) {
    setServerError(null)
    try {
      const res = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      let json: Record<string, unknown> = {}
      try {
        json = await res.json()
      } catch {
        // server returned non-JSON (e.g. 500 HTML page)
      }

      if (!res.ok) {
        setServerError(
          (json.error as string) ?? `Сървърна грешка (${res.status}). Моля, опитайте отново.`
        )
        return
      }

      setSuccess(true)
      toast.success('Заявката за отмяна е изпратена успешно!')
    } catch {
      setServerError('Не може да се свърже със сървъра. Проверете връзката си и опитайте отново.')
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <div className="text-4xl">📩</div>
          <p className="font-semibold text-lg">Заявката е изпратена!</p>
          <p className="text-muted-foreground text-sm">
            Благодарим, че сигнализирахте! Това помага да организираме процесът по-добре. Ще обработим заявката ръчно.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заявка за отмяна</CardTitle>
        <CardDescription>
          Въведете вашето име и ще намерим вашата резервация.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Вашето име *</Label>
            <Input
              id="name"
              placeholder="Иван Иванов"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Дата на резервацията (незадължително)</Label>
            <Input
              id="date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Помага при намирането на резервацията, ако имате повече от една.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">
              Причина за отмяна / ориентировъчна дата, ако не помниш точната *
            </Label>
            <textarea
              id="message"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="напр. Не мога да дойда на 15 май, приблизително беше средата на месеца…"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Изпращане…' : 'Изпрати заявка за отмяна'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
