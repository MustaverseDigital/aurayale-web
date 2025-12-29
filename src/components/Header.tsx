import { Menu } from "lucide-react"
import { LogOut } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-[#D9D9D9]/5 border-b border-[#898cd2]/30 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 max-w-md mx-auto">
        <div className="text-2xl font-bold text-white">
          <img src="/img/Logo_s.svg" alt="" />
        </div>

        <button className="p-2">
          <LogOut className="w-6 h-6 text-white" />
        </button>
      </div>
    </header>
  )
}

