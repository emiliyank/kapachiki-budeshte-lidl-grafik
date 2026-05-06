'use client'
import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'LIDL'
  createdAt: string
}

interface InviteResult {
  url: string
  token: string
  expiresAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'LIDL'>('LIDL')
  const [inviteEmail, setInviteEmail] = useState('')
  const [generatingInvite, setGeneratingInvite] = useState(false)
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleGenerateInvite() {
    setGeneratingInvite(true)
    setInviteResult(null)
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: inviteRole,
          email: inviteEmail || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Грешка при генериране на покана.')
        return
      }
      setInviteResult(json)
      toast.success('Поканата е генерирана успешно!')
    } catch {
      toast.error('Мрежова грешка.')
    } finally {
      setGeneratingInvite(false)
    }
  }

  async function handleCopy() {
    if (!inviteResult) return
    await navigator.clipboard.writeText(inviteResult.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ROLE_LABELS = { ADMIN: 'Администратор', LIDL: 'Лидл' }

  return (
    <div className="space-y-8">
      {/* Generate invite link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Генериране на покана</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Роля</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as 'ADMIN' | 'LIDL')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIDL">Лидл</SelectItem>
                  <SelectItem value="ADMIN">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inviteEmail">Имейл (незадължително)</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="ivan@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleGenerateInvite} disabled={generatingInvite}>
            {generatingInvite ? 'Генериране…' : 'Генерирай покана'}
          </Button>

          {inviteResult && (
            <Alert>
              <AlertDescription className="space-y-2">
                <p className="text-sm font-medium">Линк за покана (валиден 7 дни):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-gray-100 px-2 py-1 text-xs break-all">
                    {inviteResult.url}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? '✓ Копирано' : 'Копирай'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Изтича: {(() => {
                    try {
                      return format(new Date(inviteResult.expiresAt), 'd MMM yyyy, HH:mm', { locale: bg })
                    } catch {
                      return inviteResult.expiresAt
                    }
                  })()}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Users table */}
      <div className="space-y-3">
        <h3 className="font-medium">Потребители в системата</h3>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Зареждане…</div>
        ) : users.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Няма регистрирани потребители.
          </div>
        ) : (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Име</TableHead>
                  <TableHead>Имейл</TableHead>
                  <TableHead>Роля</TableHead>
                  <TableHead>Добавен</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(() => {
                        try {
                          return format(new Date(u.createdAt), 'd MMM yyyy', { locale: bg })
                        } catch {
                          return u.createdAt
                        }
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
