import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Company AI Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Merkezi veri yönetimi ve departman bazlı akıllı chatbotlarla
          şirket bilginize güvenli ve hızlı erişim sağlayın.
        </p>
        <Button size="lg" className="text-lg px-8 py-3">
          Başla
        </Button>
      </div>
    </main>
  )
}