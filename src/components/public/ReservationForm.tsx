'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createReservationSchema, type CreateReservationInput } from '@/lib/validations'
import { toast } from 'sonner'

const CONTAINER_LABELS: Record<string, string> = {
  TUBE_5L: 'Туба 5 л (0.5 единици)',
  TUBE_10L: 'Туба 10 л (1 единица)',
  BAG: 'Чувал (3 единици)',
}

export function ReservationForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dateParam = searchParams.get('date') ?? ''
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      date: dateParam,
      containerSize: 'TUBE_10L',
    },
  })

  const containerSize = watch('containerSize')

  async function onSubmit(data: CreateReservationInput) {
    setServerError(null)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error ?? 'Грешка при запазване на резервацията.')
        return
      }
      setSuccess(true)
      toast.success('Резервацията е запазена успешно!')
      setTimeout(() => router.push('/'), 2500)
    } catch {
      setServerError('Мрежова грешка. Моля, опитайте отново.')
    }
  }

  const displayDate = dateParam
    ? (() => {
        try {
          return format(parseISO(dateParam), 'd MMMM yyyy', { locale: bg })
        } catch {
          return dateParam
        }
      })()
    : null

  if (success) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <div className="text-4xl">✅</div>
          <p className="font-semibold text-lg">Резервацията е потвърдена!</p>
          {displayDate && (
            <p className="text-muted-foreground">Очакваме ви на {displayDate}.</p>
          )}
          <p className="text-sm text-muted-foreground">Пренасочване към началната страница…</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Нова резервация</CardTitle>
        {displayDate && (
          <CardDescription>Дата: {displayDate}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input type="hidden" {...register('date')} />

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
            <Label htmlFor="email">Имейл (незадължителен)</Label>
            <Input
              id="email"
              type="email"
              placeholder="ivan@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Ако посочите имейл, ще получите напомняне преди деня.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Размер на контейнера *</Label>
            <Select
              value={containerSize}
              onValueChange={(val) =>
                setValue('containerSize', val as CreateReservationInput['containerSize'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Изберете контейнер" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTAINER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.containerSize && (
              <p className="text-sm text-red-600">{errors.containerSize.message}</p>
            )}
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Назад
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !dateParam}>
              {isSubmitting ? 'Запазване…' : 'Запази резервация'}
            </Button>
          </div>

          {!dateParam && (
            <p className="text-sm text-red-600">
              Не е избрана дата. Моля, изберете дата от календара.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
