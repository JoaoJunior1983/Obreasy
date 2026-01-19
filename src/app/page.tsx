"use client"

import { Building2, TrendingUp, Wallet, Users, CheckCircle2, ArrowRight, FileText, Layers } from "lucide-react"
import DashboardCard from "@/components/custom/dashboard-card"
import Navbar from "@/components/custom/navbar"
import Quiz from "@/components/custom/quiz"
import AuthModal from "@/components/custom/auth-modal"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [quizData, setQuizData] = useState<any>(null)
  const [fromQuiz, setFromQuiz] = useState(false) // Novo estado para rastrear origem do quiz

  const handleLoginClick = () => {
    setFromQuiz(false) // Acesso direto, não vem do quiz
    setShowAuthModal(true)
  }

  const handleQuizComplete = (data: any) => {
    setQuizData(data)
    setShowQuiz(false)
    setFromQuiz(true) // Marca que vem do quiz
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar onLoginClick={handleLoginClick} />

      {/* Quiz Modal */}
      {showQuiz && <Quiz onClose={() => setShowQuiz(false)} onComplete={handleQuizComplete} />}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => {
            setShowAuthModal(false)
            setFromQuiz(false) // Reset ao fechar
          }} 
          hasQuizData={!!quizData}
          quizData={quizData}
          fromQuiz={fromQuiz} // Passa a prop para o modal
        />
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40">
        {/* Logo OBREASY como marca d'água em AZUL com maior opacidade */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/65b95674-2df1-4ea5-a87c-c130e4cddfb8.png"
              alt=""
              width={1200}
              height={1200}
              className="opacity-[0.03] scale-150"
              style={{ filter: 'sepia(100%) saturate(300%) hue-rotate(180deg) brightness(0.6)' }}
              priority
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge - DESTAQUE AUMENTADO */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 px-6 py-3 rounded-full text-base sm:text-lg font-bold mb-8 border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
              Economize até 20% na sua obra
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Sua obra, <span className="text-blue-500">simples</span> e sob controle
            </h1>
            
            {/* Description */}
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-10 max-w-3xl mx-auto">
              Controle gastos, acompanhe o andamento e organize sua obra em um só lugar.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button 
                onClick={handleLoginClick}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:scale-105 transform"
              >
                Entrar / Criar conta
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowQuiz(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Veja sua obra com clareza em poucos passos
              </button>
            </div>

            {/* Stats - ATUALIZADO */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t border-slate-700/50">
              <div>
                <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">20%</p>
                <p className="text-sm sm:text-base text-gray-300 font-medium">Economia média na obra</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-2">100%</p>
                <p className="text-sm sm:text-base text-gray-300 font-medium">Controle e transparência</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-bold text-white mb-2">24/7</p>
                <p className="text-sm sm:text-base text-gray-300 font-medium">Acesso e controle total</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            {/* Prova Social Agregada */}
            <div className="mb-6 space-y-2">
              <p className="text-lg font-semibold text-blue-400">
                Mais de 3.200 obras organizadas com o OBREASY
              </p>
              <p className="text-lg font-semibold text-emerald-400">
                Clientes já economizaram mais de R$ 18 milhões em obras
              </p>
            </div>

            {/* Título Principal */}
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Quem usa o OBREASY economiza de verdade
            </h2>
            
            {/* Subtítulo */}
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Mais de 3.200 clientes já organizaram suas obras, reduziram desperdícios e mantiveram o orçamento sob controle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 - Carlos Moreira */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/30 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Carlos Moreira</h3>
                <p className="text-sm text-gray-400">Construção residencial</p>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                "Antes do OBREASY eu não tinha controle real da obra. Com o acompanhamento de despesas e mão de obra, consegui eliminar desperdícios e evitar compras duplicadas. No final, economizei cerca de R$ 42.000."
              </p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                Economia comprovada de R$ 42.000
              </div>
            </div>

            {/* Testimonial 2 - Fernanda Silva */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/30 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Fernanda Silva</h3>
                <p className="text-sm text-gray-400">Reforma de apartamento</p>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                "O aplicativo me ajudou a organizar gastos, profissionais e pagamentos. Só de evitar retrabalho e compras duplicadas, consegui reduzir mais de R$ 28.000 na reforma."
              </p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                Economia comprovada de R$ 28.000
              </div>
            </div>

            {/* Testimonial 3 - João Pereira */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/30 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">João Pereira</h3>
                <p className="text-sm text-gray-400">Casa própria</p>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                "Com o OBREASY passei a acompanhar tudo em tempo real. O custo por metro quadrado ficou claro e consegui manter a obra dentro do orçamento, economizando aproximadamente R$ 60.000."
              </p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                Economia comprovada de R$ 60.000
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <DashboardPreview />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Tudo que você precisa para controlar sua obra
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Funcionalidades pensadas para quem quer controle, clareza e economia na obra
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "Gestão de Obras",
                description: "Crie e acompanhe uma ou várias obras com visão clara de custos, prazos e progresso"
              },
              {
                icon: Wallet,
                title: "Controle Financeiro",
                description: "Registre despesas e pagamentos e acompanhe o orçamento em tempo real"
              },
              {
                icon: Users,
                title: "Profissionais",
                description: "Gerencie profissionais, pagamentos e custos extras sem perder o controle"
              },
              {
                icon: Layers,
                title: "Fases da Obra",
                description: "Acompanhe o andamento de cada etapa da obra, do início à entrega"
              },
              {
                icon: FileText,
                title: "Relatórios",
                description: "Gere relatórios em PDF com todos os dados financeiros e de andamento da obra"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/30 hover:border-blue-500/30 hover:shadow-lg transition-all group"
              >
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-colors">
                  <feature.icon className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Pronto para organizar sua obra?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Comece agora e tenha controle total sobre sua construção ou reforma
          </p>
          <button 
            onClick={handleLoginClick}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold text-lg shadow-2xl hover:shadow-blue-500/50 inline-flex items-center gap-2 hover:scale-105 transform"
          >
            Criar minha primeira obra
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/65b95674-2df1-4ea5-a87c-c130e4cddfb8.png"
              alt="OBREASY Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-bold text-2xl text-white">OBREASY</span>
          </div>
          <p className="text-gray-300 mb-2">
            Sua obra, simples e sob controle
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 OBREASY. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Componente separado para o Dashboard Preview com animações
function DashboardPreview() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      id="dashboard" 
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/40 to-slate-900/30"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Dashboard Completo
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Acompanhe todos os números da sua obra em tempo real com clareza e precisão
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AnimatedCard delay={0} isVisible={isVisible}>
            <DashboardCard
              title="Orçamento Total"
              value="R$ 100.000"
              subtitle="Valor planejado"
              icon={Wallet}
              iconColor="text-blue-400"
              iconBg="bg-blue-500/10"
            />
          </AnimatedCard>
          
          <AnimatedCard delay={100} isVisible={isVisible}>
            <DashboardCard
              title="Total Gasto"
              value="R$ 85.420"
              subtitle="85,4% do orçamento"
              icon={TrendingUp}
              trend={{ value: "14,6%", positive: false }}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/10"
            />
          </AnimatedCard>
          
          <AnimatedCard delay={200} isVisible={isVisible}>
            <DashboardCard
              title="Saldo Disponível"
              value="R$ 14.580"
              subtitle="14,6% restante"
              icon={Wallet}
              iconColor="text-yellow-400"
              iconBg="bg-yellow-500/10"
            />
          </AnimatedCard>
          
          <AnimatedCard delay={300} isVisible={isVisible}>
            <DashboardCard
              title="Custo por m²"
              value="R$ 1.708"
              subtitle="Área: 50m²"
              icon={Building2}
              trend={{ value: "Dentro do esperado", positive: true }}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/10"
            />
          </AnimatedCard>
        </div>

        {/* Financial Breakdown */}
        <AnimatedCard delay={400} isVisible={isVisible}>
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/30 shadow-lg backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-8">
              Distribuição de Gastos
            </h3>
            <div className="space-y-8">
              {/* Materials */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-semibold text-lg">Materiais</span>
                  <div className="text-right">
                    <AnimatedValue 
                      value={51252} 
                      prefix="R$ " 
                      isVisible={isVisible}
                      className="font-bold text-white text-xl"
                    />
                    <div className="text-sm text-gray-400">R$ 1.025/m²</div>
                  </div>
                </div>
                <div className="relative w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                  <AnimatedBar 
                    width={60} 
                    isVisible={isVisible}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full shadow-lg shadow-blue-500/30"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <AnimatedPercentage 
                    value={60} 
                    isVisible={isVisible}
                    className="text-blue-400 font-semibold"
                  />
                  <span className="text-gray-400">60% do total gasto</span>
                </div>
              </div>

              {/* Labor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-semibold text-lg">Mão de obra</span>
                  <div className="text-right">
                    <AnimatedValue 
                      value={34168} 
                      prefix="R$ " 
                      isVisible={isVisible}
                      className="font-bold text-white text-xl"
                    />
                    <div className="text-sm text-gray-400">R$ 683/m²</div>
                  </div>
                </div>
                <div className="relative w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                  <AnimatedBar 
                    width={40} 
                    isVisible={isVisible}
                    delay={200}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 h-4 rounded-full shadow-lg shadow-emerald-500/30"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <AnimatedPercentage 
                    value={40} 
                    isVisible={isVisible}
                    delay={200}
                    className="text-emerald-400 font-semibold"
                  />
                  <span className="text-gray-400">40% do total gasto</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </section>
  )
}

// Componente para animar cards com fade + slide
function AnimatedCard({ 
  children, 
  delay = 0,
  isVisible 
}: { 
  children: React.ReactNode
  delay?: number
  isVisible: boolean
}) {
  return (
    <div
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Componente para animar barras de progresso
function AnimatedBar({ 
  width, 
  isVisible,
  delay = 0,
  className 
}: { 
  width: number
  isVisible: boolean
  delay?: number
  className: string
}) {
  return (
    <div
      className={className}
      style={{
        width: isVisible ? `${width}%` : '0%',
        transition: 'width 1.5s ease-out',
        transitionDelay: `${delay + 400}ms`
      }}
    />
  )
}

// Componente para animar valores numéricos
function AnimatedValue({ 
  value, 
  prefix = '', 
  isVisible,
  className 
}: { 
  value: number
  prefix?: string
  isVisible: boolean
  className: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString('pt-BR')}
    </span>
  )
}

// Componente para animar percentuais
function AnimatedPercentage({ 
  value, 
  isVisible,
  delay = 0,
  className 
}: { 
  value: number
  isVisible: boolean
  delay?: number
  className: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      const duration = 1000
      const steps = 30
      const increment = value / steps
      let current = 0

      const counter = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(counter)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(counter)
    }, delay + 400)

    return () => clearTimeout(timer)
  }, [isVisible, value, delay])

  return (
    <span className={className}>
      {displayValue}%
    </span>
  )
}
