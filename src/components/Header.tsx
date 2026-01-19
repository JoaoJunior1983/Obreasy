"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { User, LogOut, FolderOpen, Bell, HelpCircle, Settings } from "lucide-react"
import { getActiveObra } from "@/lib/storage"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState("")
  const [userInitials, setUserInitials] = useState("U")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [obraAtiva, setObraAtiva] = useState<string | null>(null)
  const [activeObraId, setActiveObraId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const loadUserData = () => {
    // Priorizar userProfile
    const userProfileStr = localStorage.getItem("userProfile")
    const userDataStr = localStorage.getItem("user")
    
    let name = ""
    let email = ""
    let avatar: string | null = null

    if (userProfileStr) {
      const profile = JSON.parse(userProfileStr)
      name = profile.name || ""
      email = profile.email || ""
      avatar = profile.avatarDataUrl || null
    } else if (userDataStr) {
      const user = JSON.parse(userDataStr)
      name = user.name || ""
      email = user.email || ""
      avatar = user.avatarDataUrl || null
    }

    setUserName(name)
    setAvatarUrl(avatar)
    
    // Gerar iniciais
    if (name) {
      const parts = name.trim().split(" ")
      if (parts.length >= 2) {
        setUserInitials(parts[0][0] + parts[parts.length - 1][0])
      } else {
        setUserInitials(parts[0][0])
      }
    } else if (email) {
      setUserInitials(email[0])
    } else {
      setUserInitials("U")
    }
  }

  useEffect(() => {
    loadUserData()

    // Carregar obra ativa
    const obra = getActiveObra()
    setObraAtiva(obra?.nome || null)
    setActiveObraId(obra?.id || null)

    // Listener para atualização de perfil
    const handleProfileUpdate = () => {
      loadUserData()
    }

    window.addEventListener("userProfileUpdated", handleProfileUpdate)

    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate)
    }
  }, [pathname])

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    if (menuOpen || notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen, notificationsOpen])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("activeObraId")
    router.push("/")
  }

  const handleNavigation = (path: string) => {
    setMenuOpen(false)
    setNotificationsOpen(false)
    router.push(path)
  }

  const handleLogoClick = () => {
    if (activeObraId) {
      router.push(`/dashboard?obraId=${activeObraId}`)
    } else {
      router.push("/obras")
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo clicável */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="Ir para página inicial"
          >
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/f350fbaf-266c-404d-8471-e0e89b5a6eda.jpg" 
              alt="Obreasy" 
              className="h-10 w-auto"
            />

          </button>

          {/* Centro - Obra ativa */}
          <div className="hidden md:flex items-center">
            {obraAtiva ? (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FolderOpen className="w-4 h-4" />
                <span className="font-medium">{obraAtiva}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Nenhuma obra selecionada</span>
            )}
          </div>

          {/* Ícones de ação e avatar */}
          <div className="flex items-center gap-3">
            {/* Ícone de notificações (sino) */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-800 transition-colors relative"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5 text-gray-300" />
              </button>

              {/* Painel de notificações */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Cabeçalho */}
                  <div className="px-4 py-3 border-b border-slate-700">
                    <h3 className="text-sm font-semibold text-white">Notificações</h3>
                  </div>

                  {/* Lista de notificações */}
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                      Nenhuma notificação
                    </div>
                  </div>

                  {/* Rodapé com ação de configurar */}
                  <div className="border-t border-slate-700 mt-2">
                    <button
                      onClick={() => handleNavigation("/dashboard/alertas")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-400 hover:bg-slate-700/50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Configurar alertas
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar e menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors overflow-hidden"
                aria-label="Menu do usuário"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userInitials.toUpperCase()}</span>
                )}
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Nome do usuário */}
                  {userName && (
                    <div className="px-4 py-2 border-b border-slate-700">
                      <p className="text-sm font-medium text-white truncate">{userName}</p>
                    </div>
                  )}

                  {/* Opções do menu */}
                  <button
                    onClick={() => handleNavigation("/dashboard/conta")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Minha Conta
                  </button>

                  <button
                    onClick={() => handleNavigation("/obras")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Minhas Obras
                  </button>

                  <button
                    onClick={() => handleNavigation("/dashboard/alertas")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    Alertas
                  </button>

                  <button
                    onClick={() => handleNavigation("/dashboard/suporte")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Suporte
                  </button>

                  <div className="border-t border-slate-700 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
