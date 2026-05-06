'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { globalSettingsSchema, type GlobalSettingsInput } from '@/lib/validations'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GlobalSettingsInput>({
    resolver: zodResolver(globalSettingsSchema),
    defaultValues: { defaultCapacity: 6 },
  })

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        reset({ defaultCapacity: data.defaultCapacity ?? 6 })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [reset])

  async function onSubmit(data: GlobalSettingsInput) {
    setServerError(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error ?? 'Грешка при запазване.')
        return
      }
      reset({ defaultCapacity: json.defaultCapacity })
      toast.success('Настройките са запазени!')
    } catch {
      setServerError('Мрежова грешка.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Настройки</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Управление на глобалния капацитет и системни параметри
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Глобален капацитет</CardTitle>
          <CardDescription>
            Максималният брой единици за дни без специфична конфигурация.
            (Туба 5 л = 0.5 ед., Туба 10 л = 1 ед., Чувал = 3 ед.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Зареждане…</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="defaultCapacity">
                  Капацитет по подразбиране (единици)
                </Label>
                <Input
                  id="defaultCapacity"
                  type="number"
                  step="0.5"
                  min="0.5"
                  className="max-w-[160px]"
                  {...register('defaultCapacity', { valueAsNumber: true })}
                />
                {errors.defaultCapacity && (
                  <p className="text-sm text-red-600">{errors.defaultCapacity.message}</p>
                )}
              </div>

              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Запазване…' : 'Запази настройките'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Работно време на Лидл</CardTitle>
          <CardDescription>
            Информация за работното време (само за справка)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Понеделник — Събота</span>
              <span className="font-medium">07:30 — 21:30</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Неделя</span>
              <span className="font-medium">08:00 — 21:00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
