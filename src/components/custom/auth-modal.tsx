"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, ArrowRight, Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AuthModalProps {
  onClose: () => void
  hasQuizData?: boolean
  quizData?: any
  onSuccess?: () => void
  fromQuiz?: boolean // Nova prop para identificar origem do quiz
}

export default function AuthModal({ onClose, hasQuizData = false, quizData, onSuccess, fromQuiz = false }: AuthModalProps) {
  const router = useRouter()
  // Se vier do quiz, inicia direto no modo "signup", caso contrário, no modo "choice"
  const [mode, setMode] = useState<"choice" | "login" | "signup" | "forgot-password">(fromQuiz ? "signup" : "choice")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validação de senha para cadastro
    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem!")
      return
    }

    if (mode === "signup" && formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres!")
      return
    }

    setIsLoading(true)

    // Simular autenticação (substituir por lógica real depois)
    setTimeout(() => {
      setIsLoading(false)
      
      // Salvar dados do usuário no localStorage
      localStorage.setItem("user", JSON.stringify({
        name: formData.name,
        email: formData.email
      }))
      localStorage.setItem("isAuthenticated", "true")

      // Se houver dados do quiz, salvar também
      if (hasQuizData && quizData) {
        localStorage.setItem("quizData", JSON.stringify(quizData))
        localStorage.setItem("hasObra", "true")
      }

      // Redirecionar diretamente para o dashboard
      router.push("/dashboard")
    }, 1500)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email) {
      setError("Por favor, informe seu e-mail")
      return
    }

    // Validação básica de formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, informe um e-mail válido")
      return
    }

    setIsLoading(true)

    // Simular envio de e-mail (modo mock - sem chamar Supabase)
    setTimeout(() => {
      setIsLoading(false)
      setForgotPasswordSuccess(true)
      
      // TODO: Quando Supabase estiver conectado, substituir por:
      // if (supabase) {
      //   const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      //     formData.email,
      //     { redirectTo: `${window.location.origin}/reset-password` }
      //   )
      //   if (resetError) {
      //     // Não expor se o e-mail existe ou não (segurança)
      //     setForgotPasswordSuccess(true)
      //   } else {
      //     setForgotPasswordSuccess(true)
      //   }
      // }
    }, 1500)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {/* Choice Screen - Só aparece quando NÃO vier do quiz */}
          {mode === "choice" && !fromQuiz && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
                  Bem-vindo ao OBREASY
                </h2>
                <p className="text-gray-600 font-inter">
                  Escolha uma opção para continuar
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setMode("login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-inter font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Entrar na minha conta
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setMode("signup")}
                  className="w-full bg-white text-gray-900 px-6 py-4 rounded-xl hover:bg-gray-50 transition-all font-inter font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2"
                >
                  Criar nova conta
                  <ArrowRight className="w-5 h-5" />
                </button>

                {hasQuizData && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setMode("signup")}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-inter font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Criar minha primeira obra
                    </button>
                    <p className="text-sm text-gray-500 font-inter text-center mt-2">
                      Seus dados do quiz serão salvos automaticamente
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Login Screen */}
          {mode === "login" && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
                  Entrar
                </h2>
                <p className="text-gray-600 font-inter">
                  Acesse sua conta OBREASY
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none font-inter transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none font-inter transition-colors"
                    />
                  </div>
                </div>

                {/* Botão "Esqueci minha senha" desativado temporariamente */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-blue-600 hover:text-blue-700 font-inter text-sm font-medium"
                  >
                    Não tem conta? Criar agora
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setMode("choice")}
                  className="w-full text-gray-500 hover:text-gray-700 transition-colors font-inter text-sm"
                >
                  Voltar
                </button>
              </form>
            </div>
          )}

          {/* Forgot Password Screen */}
          {mode === "forgot-password" && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
                  Recuperar senha
                </h2>
                <p className="text-gray-600 font-inter">
                  Informe seu e-mail para receber as instruções
                </p>
              </div>

              {forgotPasswordSuccess ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-inter font-medium text-green-900">
                          Instruções enviadas!
                        </p>
                        <p className="text-xs text-green-700 font-inter mt-1">
                          Se este e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("login")
                      setForgotPasswordSuccess(false)
                      setFormData({ name: "", email: "", password: "", confirmPassword: "" })
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-inter font-semibold"
                  >
                    Voltar para login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none font-inter transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Enviando..." : "Enviar instruções"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("login")
                      setError("")
                    }}
                    className="w-full text-gray-500 hover:text-gray-700 transition-colors font-inter text-sm"
                  >
                    Voltar para login
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Signup Screen */}
          {mode === "signup" && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
                  Criar conta
                </h2>
                <p className="text-gray-600 font-inter">
                  Comece a organizar sua obra agora
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="João Silva"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none font-inter transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none font-inter transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none font-inter transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-inter mt-1">
                    Mínimo de 6 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none font-inter transition-colors"
                    />
                  </div>
                </div>

                {hasQuizData && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-inter font-medium text-emerald-900">
                          Dados do quiz salvos
                        </p>
                        <p className="text-xs text-emerald-700 font-inter mt-1">
                          Sua obra será criada automaticamente após o cadastro
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-blue-600 hover:text-blue-700 font-inter text-sm font-medium"
                  >
                    Já tem conta? Entrar
                  </button>
                </div>

                {/* Botão voltar só aparece se NÃO vier do quiz */}
                {!fromQuiz && (
                  <button
                    type="button"
                    onClick={() => setMode("choice")}
                    className="w-full text-gray-500 hover:text-gray-700 transition-colors font-inter text-sm"
                  >
                    Voltar
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
