'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { dayConfigSchema, type DayConfigInput } from '@/lib/validations'
import { toast } from 'sonner'

interface DayInfo {
  date: string
  isBlocked: boolean
  blockReason?: string | null
  usedCapacity: number
  maxCapacity: number
  availableCapacity: number
  percentFull: number
}

interface Props {
  day: DayInfo | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function DayConfigModal({ day, open, onClose, onSaved }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DayConfigInput>({
    resolver: zodResolver(dayConfigSchema),
    values: day
      ? {
          date: day.date,
          isBlocked: day.isBlocked,
          blockReason: day.blockReason ?? '',
          maxCapacity: day.maxCapacity || undefined,
        }
      : undefined,
  })

  async function onSubmit(data: DayConfigInput) {
    setServerError(null)
    try {
      const res = await fetch('/api/days', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error ?? 'Грешка при запазване.')
        return
      }
      toast.success('Конфигурацията е запазена!')
      reset()
      onSaved()
      onClose()
    } catch {
      setServerError('Мрежова грешка.')
    }
  }

  if (!day) return null

  const displayDate = (() => {
    try {
      return format(new Date(day.date), 'd MMMM yyyy', { locale: bg })
    } catch {
      return day.date
    }
  })()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Конфигурация на ден — {displayDate}</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Използван капацитет:</span>
            <span className="font-medium">{day.usedCapacity} / {day.maxCapacity} единици ({day.percentFull}%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Наличен капацитет:</span>
            <span className="font-medium">{day.availableCapacity} единици</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('date')} />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isBlocked"
              className="h-4 w-4 rounded border-gray-300"
              {...register('isBlocked')}
            />
            <Label htmlFor="isBlocked" className="cursor-pointer">
              Блокиран ден (резервациите не са разрешени)
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blockReason">Причина за блокиране (незадължително)</Label>
            <Input
              id="blockReason"
              placeholder="напр. Официален празник"
              {...register('blockReason')}
            />
            {errors.blockReason && (
              <p className="text-sm text-red-600">{errors.blockReason.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxCapacity">Максимален капацитет за деня (единици)</Label>
            <Input
              id="maxCapacity"
              type="number"
              step="0.5"
              min="0.5"
              placeholder="Оставете празно за глобалната стойност"
              {...register('maxCapacity', { valueAsNumber: true })}
            />
            {errors.maxCapacity && (
              <p className="text-sm text-red-600">{errors.maxCapacity.message}</p>
            )}
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отказ
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Запазване…' : 'Запази'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
