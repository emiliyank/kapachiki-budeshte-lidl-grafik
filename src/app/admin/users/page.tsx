import { UserManagement } from '@/components/admin/UserManagement'

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Потребители</h1>
      <UserManagement />
    </div>
  )
}
