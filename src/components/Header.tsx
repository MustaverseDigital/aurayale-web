import { Menu } from "lucide-react"

export function Header() {
  return (
    <header className="bg-card border-b border-[#898cd2]/30 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 max-w-md mx-auto">
        <div className="text-2xl font-bold text-white">⚔</div>
        <button className="p-2">
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>
    </header>
  )
}

