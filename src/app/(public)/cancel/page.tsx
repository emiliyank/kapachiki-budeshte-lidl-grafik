import { CancellationForm } from '@/components/public/CancellationForm'

export default function CancelPage() {
  return (
    <main className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Заявка за отмяна</h1>
      <CancellationForm />
    </main>
  )
}
