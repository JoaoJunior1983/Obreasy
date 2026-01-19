"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, Wallet, PiggyBank, Home, Plus, Users, FileText, AlertCircle, CheckCircle, AlertTriangle, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { NotificationPanel } from "@/components/custom/NotificationPanel"
import { 
  verificarTodosAlertas, 
  getAlertaOrcamentoByObra,
  getAlertasPrazoByObra,
  getAlertasPagamentoByObra
} from "@/lib/alerts"

const ESTADOS_BRASILEIROS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
]

interface Obra {
  id: string
  userId: string
  nome: string
  tipo: string
  area: number
  localizacao: {
    estado: string
    cidade: string
    bairro?: string
  }
  orcamento: number | null
  dataInicio?: string | null
  dataTermino?: string | null
  criadaEm: string
}

interface Despesa {
  id: string
  obraId: string
  valor: number
  data: string
  tipo?: string
  category?: string
  categoria?: string
  profissionalId?: string
  descricao?: string
}

interface Profissional {
  id: string
  obraId: string
  nome: string
  funcao: string
  valorPrevisto?: number
  contrato?: {
    valorPrevisto?: number
    valorTotalPrevisto?: number
  }
}

// Funções de formatação
const formatarMoeda = (valor: string): string => {
  const apenasNumeros = valor.replace(/\D/g, "")
  if (!apenasNumeros) return ""
  const numero = parseFloat(apenasNumeros) / 100
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const removerFormatacao = (valorFormatado: string): number => {
  const apenasNumeros = valorFormatado.replace(/\D/g, "")
  return parseFloat(apenasNumeros) / 100
}

const formatarArea = (valor: string): string => {
  const apenasNumeros = valor.replace(/\D/g, "")
  if (!apenasNumeros) return ""
  const numero = parseFloat(apenasNumeros) / 100
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const areaParaNumero = (areaFormatada: string): number => {
  const apenasNumeros = areaFormatada.replace(/\D/g, "")
  if (!apenasNumeros) return 0
  return parseFloat(apenasNumeros) / 100
}

export default function DashboardObraPage() {
  const router = useRouter()
  const [obra, setObra] = useState<Obra | null>(null)
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [detalhamentoAtivo, setDetalhamentoAtivo] = useState<"material" | "mao_obra" | null>(null)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  
  // Estados para edição e exclusão
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    nome: "",
    tipo: "",
    area: "",
    estado: "",
    cidade: "",
    bairro: "",
    orcamento: "",
    dataInicio: "",
    dataTermino: ""
  })
  const [orcamentoFormatado, setOrcamentoFormatado] = useState("")
  const [areaFormatada, setAreaFormatada] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Status dos alertas
  const [alertaOrcamentoAtivo, setAlertaOrcamentoAtivo] = useState(false)
  const [alertasPrazoCount, setAlertasPrazoCount] = useState(0)
  const [alertasPagamentoCount, setAlertasPagamentoCount] = useState(0)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    const activeObraId = localStorage.getItem("activeObraId")
    
    if (!activeObraId) {
      router.push("/obras")
      return
    }

    const user = JSON.parse(userData)
    const obrasExistentes = JSON.parse(localStorage.getItem("obras") || "[]")
    
    const obraAtiva = obrasExistentes.find((o: Obra) => o.id === activeObraId && o.userId === user.email)
    
    if (obraAtiva) {
      setObra(obraAtiva)

      const todasDespesas = JSON.parse(localStorage.getItem("despesas") || "[]")
      const despesasObra = todasDespesas.filter((d: Despesa) => d.obraId === obraAtiva.id)
      setDespesas(despesasObra)

      const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]")
      const profissionaisObra = todosProfissionais.filter((p: Profissional) => p.obraId === obraAtiva.id)
      setProfissionais(profissionaisObra)

      const totalGasto = despesasObra.reduce((acc: number, d: Despesa) => acc + (d.valor ?? 0), 0)
      verificarTodosAlertas(obraAtiva.id, obraAtiva.orcamento || 0, totalGasto)
      loadAlertasStatus(obraAtiva.id)
    } else {
      router.push("/obras")
      return
    }

    setLoading(false)
  }, [router])

  const loadAlertasStatus = (obraId: string) => {
    const alertaOrc = getAlertaOrcamentoByObra(obraId)
    setAlertaOrcamentoAtivo(alertaOrc?.ativo || false)

    const alertasPrazo = getAlertasPrazoByObra(obraId)
    setAlertasPrazoCount(alertasPrazo.length)

    const alertasPagamento = getAlertasPagamentoByObra(obraId)
    setAlertasPagamentoCount(alertasPagamento.length)
  }

  const formatarMoedaDisplay = (valor: number): string => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  const formatarData = (dataISO: string): string => {
    const data = new Date(dataISO)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const calcularDiasRestantes = (dataTermino: string): { dias: number; atrasado: boolean } => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const termino = new Date(dataTermino)
    termino.setHours(0, 0, 0, 0)
    
    const diferencaMs = termino.getTime() - hoje.getTime()
    const dias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24))
    
    return {
      dias: Math.abs(dias),
      atrasado: dias < 0
    }
  }

  const calcularTotalGasto = (): number => {
    return despesas.reduce((acc, d) => acc + (d.valor ?? 0), 0)
  }

  const calcularSaldoDisponivel = (): number => {
    if (!obra || !obra.orcamento) return 0
    return obra.orcamento - calcularTotalGasto()
  }

  const calcularCustoPorM2 = (): string => {
    if (!obra || !obra.area) return "R$ 0,00"
    const totalGasto = calcularTotalGasto()
    if (totalGasto === 0) return "R$ 0,00"
    const custo = totalGasto / obra.area
    return formatarMoedaDisplay(custo)
  }

  const calcularPercentualGasto = (): number => {
    if (!obra || !obra.orcamento || obra.orcamento === 0) return 0
    return (calcularTotalGasto() / obra.orcamento) * 100
  }

  const calcularMaoObraPrevista = (): number => {
    return profissionais.reduce((acc, p) => {
      const valorPrevisto = p.valorPrevisto || p.contrato?.valorPrevisto || p.contrato?.valorTotalPrevisto || 0
      return acc + valorPrevisto
    }, 0)
  }

  const calcularMaoObraRealizada = (): number => {
    return despesas
      .filter(d => {
        const category = String(d.category ?? d.categoria ?? d.tipo ?? "").toLowerCase()
        const isMaoObra = category === "mao_obra" || category === "mão de obra"
        const temProfissional = !!d.profissionalId
        return isMaoObra || temProfissional
      })
      .reduce((acc, d) => acc + (d.valor ?? 0), 0)
  }

  const calcularDistribuicao = () => {
    const totalGasto = calcularTotalGasto()
    const orcamentoTotal = obra?.orcamento || 0
    
    if (totalGasto === 0 && orcamentoTotal === 0) {
      return { 
        material: 0, 
        maoObra: 0, 
        outros: 0,
        percMaterial: 0, 
        percMaoObra: 0,
        percOutros: 0,
        materialOutros: 0,
        percMaterialOutros: 0
      }
    }

    const maoObra = despesas
      .filter(d => {
        const category = String(d.category ?? d.categoria ?? d.tipo ?? "").toLowerCase()
        const isMaoObra = category === "mao_obra" || category === "mão de obra"
        const temProfissional = !!d.profissionalId
        return isMaoObra || temProfissional
      })
      .reduce((acc, d) => acc + (d.valor ?? 0), 0)

    const material = despesas
      .filter(d => {
        const category = String(d.category ?? d.categoria ?? d.tipo ?? "").toLowerCase()
        const isMaoObra = category === "mao_obra" || category === "mão de obra"
        const temProfissional = !!d.profissionalId
        const isMaterial = category === "material"
        return isMaterial && !isMaoObra && !temProfissional
      })
      .reduce((acc, d) => acc + (d.valor ?? 0), 0)

    const outros = despesas
      .filter(d => {
        const category = String(d.category ?? d.categoria ?? d.tipo ?? "").toLowerCase()
        const isMaoObra = category === "mao_obra" || category === "mão de obra"
        const temProfissional = !!d.profissionalId
        const isMaterial = category === "material"
        return !isMaoObra && !temProfissional && !isMaterial
      })
      .reduce((acc, d) => acc + (d.valor ?? 0), 0)

    const materialOutros = material + outros
    
    const baseCalculo = orcamentoTotal > 0 ? orcamentoTotal : totalGasto
    
    const percMaterial = baseCalculo > 0 ? (material / baseCalculo) * 100 : 0
    const percMaoObra = baseCalculo > 0 ? (maoObra / baseCalculo) * 100 : 0
    const percOutros = baseCalculo > 0 ? (outros / baseCalculo) * 100 : 0
    const percMaterialOutros = baseCalculo > 0 ? (materialOutros / baseCalculo) * 100 : 0

    return {
      material,
      maoObra,
      outros,
      materialOutros,
      percMaterial,
      percMaoObra,
      percOutros,
      percMaterialOutros
    }
  }

  const getDespesasPorCategoria = (categoria: "material" | "mao_obra") => {
    if (categoria === "material") {
      return despesas.filter(d => {
        const category = String(d.category ?? d.categoria ?? d.tipo ?? "").toLowerCase()
        const isMaoObra = category === "mao_obra" || category === "mão de obra"
        const temProfissional = !!d.profissionalId
        return !isMaoObra && !temProfissional
      })
    }
    return despesas.filter(d => {
      const category = String(d.category ?? d.categoria ?? d.tipo ?? "").toLowerCase()
      const isMaoObra = category === "mao_obra" || category === "mão de obra"
      const temProfissional = !!d.profissionalId
      return isMaoObra || temProfissional
    })
  }

  const handleGerarRelatorio = () => {
    if (!obra) return
    router.push(`/dashboard/obras/${obra.id}/relatorio`)
  }

  // Funções de edição
  const handleOpenEditModal = () => {
    if (!obra) return
    
    setEditFormData({
      nome: obra.nome,
      tipo: obra.tipo,
      area: obra.area.toString(),
      estado: obra.localizacao.estado,
      cidade: obra.localizacao.cidade,
      bairro: obra.localizacao.bairro || "",
      orcamento: obra.orcamento?.toString() || "",
      dataInicio: obra.dataInicio || "",
      dataTermino: obra.dataTermino || ""
    })
    
    // Formatar valores para exibição
    if (obra.orcamento) {
      const valorFormatado = (obra.orcamento * 100).toString().replace(/\D/g, "")
      setOrcamentoFormatado(formatarMoeda(valorFormatado))
    } else {
      setOrcamentoFormatado("")
    }
    
    const areaFormatadaValue = (obra.area * 100).toString().replace(/\D/g, "")
    setAreaFormatada(formatarArea(areaFormatadaValue))
    
    setShowActionsMenu(false)
    setShowEditModal(true)
  }

  const handleOrcamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value
    const valorFormatado = formatarMoeda(valorDigitado)
    setOrcamentoFormatado(valorFormatado)
    
    const valorNumerico = removerFormatacao(valorFormatado)
    setEditFormData({ ...editFormData, orcamento: valorNumerico > 0 ? valorNumerico.toString() : "" })
  }

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value
    const valorFormatado = formatarArea(valorDigitado)
    setAreaFormatada(valorFormatado)
    
    const valorNumerico = areaParaNumero(valorFormatado)
    setEditFormData({ ...editFormData, area: valorNumerico > 0 ? valorNumerico.toString() : "" })
  }

  const handleSaveEdit = () => {
    if (!obra) return

    // Validar campos obrigatórios
    if (!editFormData.nome || !editFormData.tipo || !editFormData.area || !editFormData.estado || !editFormData.cidade) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    // Atualizar obra no localStorage
    const obrasExistentes = JSON.parse(localStorage.getItem("obras") || "[]")
    const obraIndex = obrasExistentes.findIndex((o: Obra) => o.id === obra.id)
    
    if (obraIndex !== -1) {
      obrasExistentes[obraIndex] = {
        ...obrasExistentes[obraIndex],
        nome: editFormData.nome,
        tipo: editFormData.tipo,
        area: parseFloat(editFormData.area),
        localizacao: {
          estado: editFormData.estado,
          cidade: editFormData.cidade,
          bairro: editFormData.bairro
        },
        orcamento: editFormData.orcamento ? parseFloat(editFormData.orcamento) : null,
        dataInicio: editFormData.dataInicio || null,
        dataTermino: editFormData.dataTermino || null
      }
      
      localStorage.setItem("obras", JSON.stringify(obrasExistentes))
      
      // Atualizar estado local
      setObra(obrasExistentes[obraIndex])
      setShowEditModal(false)
      
      // Feedback de sucesso
      alert("Obra atualizada com sucesso!")
    }
  }

  // Funções de exclusão
  const handleOpenDeleteModal = () => {
    setShowActionsMenu(false)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (!obra) return
    
    setIsDeleting(true)

    try {
      // Remover obra
      const obrasExistentes = JSON.parse(localStorage.getItem("obras") || "[]")
      const obrasAtualizadas = obrasExistentes.filter((o: Obra) => o.id !== obra.id)
      localStorage.setItem("obras", JSON.stringify(obrasAtualizadas))

      // Remover despesas associadas
      const todasDespesas = JSON.parse(localStorage.getItem("despesas") || "[]")
      const despesasAtualizadas = todasDespesas.filter((d: Despesa) => d.obraId !== obra.id)
      localStorage.setItem("despesas", JSON.stringify(despesasAtualizadas))

      // Remover profissionais associados
      const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]")
      const profissionaisAtualizados = todosProfissionais.filter((p: Profissional) => p.obraId !== obra.id)
      localStorage.setItem("profissionais", JSON.stringify(profissionaisAtualizados))

      // Remover alertas associados
      const todosAlertas = JSON.parse(localStorage.getItem("alertas") || "[]")
      const alertasAtualizados = todosAlertas.filter((a: any) => a.obraId !== obra.id)
      localStorage.setItem("alertas", JSON.stringify(alertasAtualizados))

      // Limpar obra ativa
      localStorage.removeItem("activeObraId")

      // Redirecionar para Minhas Obras
      router.push("/obras")
    } catch (error) {
      console.error("Erro ao excluir obra:", error)
      alert("Erro ao excluir obra. Tente novamente.")
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!obra) {
    return null
  }

  const totalGasto = calcularTotalGasto()
  const saldoDisponivel = calcularSaldoDisponivel()
  const percentualGasto = calcularPercentualGasto()
  const distribuicao = calcularDistribuicao()
  const maoObraPrevista = calcularMaoObraPrevista()
  const maoObraRealizada = calcularMaoObraRealizada()

  const temPrazo = obra.dataInicio || obra.dataTermino
  const prazoInfo = obra.dataTermino ? calcularDiasRestantes(obra.dataTermino) : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER COM LOGO - Integrado ao dark mode */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between bg-slate-900/40 backdrop-blur-md p-4 rounded-xl shadow-2xl shadow-black/40">
          <Image
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/979b9040-0d37-4e0d-ae77-88fcfe603d77.png"
            alt="Logo OBREASY"
            width={120}
            height={120}
            className="h-10 sm:h-12 w-auto"
            priority
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/obras")}
            className="mb-4 hover:bg-slate-800/50 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Minhas Obras
          </Button>

          {/* IDENTIFICAÇÃO DA OBRA + STATUS DE PRAZO + AÇÕES */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Home className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                    {obra.nome}
                  </h1>
                  
                  {/* Menu de ações (três pontos) */}
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all"
                      title="Ações da obra"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {showActionsMenu && (
                      <>
                        {/* Overlay para fechar o menu ao clicar fora */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowActionsMenu(false)}
                        />
                        
                        {/* Menu dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-700/50 py-1 z-20">
                          <button
                            onClick={handleOpenEditModal}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar obra
                          </button>
                          <button
                            onClick={handleOpenDeleteModal}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir obra
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mt-1">
                  {obra.tipo === "construcao" ? "Construção" : "Reforma"} • {obra.localizacao.cidade}/{obra.localizacao.estado}
                </p>
                
                {/* PAINEL COMPACTO DE PRAZO */}
                {prazoInfo && (
                  <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    prazoInfo.atrasado 
                      ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                      : prazoInfo.dias <= 7
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                  }`}>
                    {prazoInfo.atrasado ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : prazoInfo.dias <= 7 ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>
                      {prazoInfo.atrasado 
                        ? `Atrasado há ${prazoInfo.dias} ${prazoInfo.dias === 1 ? "dia" : "dias"}`
                        : `Faltam ${prazoInfo.dias} ${prazoInfo.dias === 1 ? "dia" : "dias"}`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botão Gerar Relatório */}
            <Button
              onClick={handleGerarRelatorio}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/20"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório (PDF)
            </Button>
          </div>
        </div>

        {/* INDICADORES FINANCEIROS - PRIORIDADE MÁXIMA (camada mais elevada) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <Card className="p-5 sm:p-6 bg-slate-800 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.5)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-blue-500/15 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium mb-1">Orçamento Estimado</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {obra.orcamento ? formatarMoedaDisplay(obra.orcamento) : "Não definido"}
            </p>
          </Card>

          <Card className="p-5 sm:p-6 bg-slate-800 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.5)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-red-500/15 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium mb-1">Total Gasto</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{formatarMoedaDisplay(totalGasto)}</p>
            {obra.orcamento && (
              <p className="text-xs text-gray-500 mt-1">{percentualGasto.toFixed(1)}% do orçamento</p>
            )}
          </Card>

          <Card className="p-5 sm:p-6 bg-slate-800 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.5)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-green-500/15 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium mb-1">Saldo Disponível</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {obra.orcamento ? formatarMoedaDisplay(saldoDisponivel) : "R$ 0,00"}
            </p>
          </Card>

          <Card className="p-5 sm:p-6 bg-slate-800 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.5)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-purple-500/15 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium mb-1">Custo por m²</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{calcularCustoPorM2()}</p>
            <p className="text-xs text-gray-500 mt-1">{obra.area} m²</p>
          </Card>
        </div>

        {/* CARDS OPERACIONAIS - PRIORIDADE MÉDIA (camada intermediária) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <Card className="p-5 sm:p-6 bg-slate-900/60 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.3)] hover:shadow-[0_6px_25px_rgb(0,0,0,0.35)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Despesas</h3>
                <p className="text-sm text-gray-400">
                  {despesas.length} {despesas.length === 1 ? "despesa registrada" : "despesas registradas"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/dashboard/despesas/nova")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
              <Button
                onClick={() => router.push("/dashboard/despesas")}
                className="flex-1 bg-[#1F2937] hover:bg-[#374151] text-white border-0 shadow-sm"
              >
                Ver todas
              </Button>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 bg-slate-900/60 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.3)] hover:shadow-[0_6px_25px_rgb(0,0,0,0.35)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Profissionais</h3>
                <p className="text-sm text-gray-400">
                  {profissionais.length} {profissionais.length === 1 ? "profissional cadastrado" : "profissionais cadastrados"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/dashboard/profissionais/novo")}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Profissional
              </Button>
              <Button
                onClick={() => router.push("/dashboard/profissionais")}
                className="flex-1 bg-[#1F2937] hover:bg-[#374151] text-white border-0 shadow-sm"
              >
                Ver todos
              </Button>
            </div>
          </Card>
        </div>

        {/* SEÇÃO INFORMATIVA - DISTRIBUIÇÃO DE GASTOS (camada base) */}
        {totalGasto > 0 && (
          <Card className="p-5 sm:p-6 md:p-8 bg-slate-950/40 border-0 shadow-[0_2px_15px_rgb(0,0,0,0.2)] mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-6">Distribuição de Gastos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div 
                className="border border-slate-800/50 rounded-xl p-5 sm:p-6 hover:border-slate-700/50 transition-all cursor-pointer bg-slate-900/20"
                onClick={() => setDetalhamentoAtivo(detalhamentoAtivo === "material" ? null : "material")}
              >
                <h3 className="text-lg font-bold text-white mb-4">Material / Outros</h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">
                    {obra.orcamento ? "% do orçamento" : "Total acumulado"}
                  </span>
                  <span className="text-sm font-bold text-blue-400">
                    {distribuicao.percMaterialOutros.toFixed(1)}%
                  </span>
                </div>
                
                <div className="h-4 bg-slate-800/50 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.min(distribuicao.percMaterialOutros, 100)}%` }}
                  />
                </div>
                
                <p className="text-2xl sm:text-3xl font-bold text-white">{formatarMoedaDisplay(distribuicao.materialOutros)}</p>
                
                {distribuicao.materialOutros === 0 && (
                  <p className="text-sm text-gray-500 italic mt-2">Nenhuma despesa registrada ainda</p>
                )}
              </div>

              <div 
                className="border border-slate-800/50 rounded-xl p-5 sm:p-6 hover:border-slate-700/50 transition-all cursor-pointer bg-slate-900/20"
                onClick={() => setDetalhamentoAtivo(detalhamentoAtivo === "mao_obra" ? null : "mao_obra")}
              >
                <h3 className="text-lg font-bold text-white mb-4">Mão de Obra</h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">
                    {obra.orcamento ? "% do orçamento" : "Total acumulado"}
                  </span>
                  <span className="text-sm font-bold text-orange-400">
                    {distribuicao.percMaoObra.toFixed(1)}%
                  </span>
                </div>
                
                <div className="h-4 bg-slate-800/50 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                    style={{ width: `${Math.min(distribuicao.percMaoObra, 100)}%` }}
                  />
                </div>
                
                <p className="text-2xl sm:text-3xl font-bold text-white">{formatarMoedaDisplay(distribuicao.maoObra)}</p>
                
                {maoObraPrevista > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Previsto: {formatarMoedaDisplay(maoObraPrevista)}
                  </p>
                )}
                
                {distribuicao.maoObra === 0 && (
                  <p className="text-sm text-gray-500 italic mt-2">Nenhuma despesa registrada ainda</p>
                )}
              </div>
            </div>

            {detalhamentoAtivo && (
              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <h4 className="text-md font-bold text-white mb-4">
                  Despesas de {detalhamentoAtivo === "material" ? "Material / Outros" : "Mão de Obra"}
                </h4>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getDespesasPorCategoria(detalhamentoAtivo).length > 0 ? (
                    getDespesasPorCategoria(detalhamentoAtivo).map((despesa: any) => (
                      <div key={despesa.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{despesa.descricao || "Sem descrição"}</p>
                          <p className="text-sm text-gray-400">{despesa.data ? formatarData(despesa.data) : "Sem data"}</p>
                        </div>
                        <p className="font-bold text-white">{formatarMoedaDisplay(despesa.valor)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      Nenhuma despesa nesta categoria
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        {despesas.length === 0 && (
          <Card className="p-6 sm:p-8 md:p-12 bg-slate-950/40 border-0 shadow-[0_2px_15px_rgb(0,0,0,0.2)] mb-6 sm:mb-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-full mb-6">
                <Wallet className="w-10 h-10 text-blue-400" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Nenhuma despesa lançada ainda
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Comece registrando sua primeira despesa para acompanhar os gastos da obra em tempo real.
              </p>

              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all px-8 py-6 text-lg"
                onClick={() => router.push("/dashboard/despesas/nova")}
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar primeira despesa
              </Button>

              <p className="text-sm text-gray-500 mt-6">
                Registre materiais, mão de obra, equipamentos e outros custos
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Painel de notificações */}
      <NotificationPanel 
        obraId={obra.id}
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full my-8 border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Editar Obra</h2>
              <p className="text-sm text-gray-400 mt-1">Atualize os dados básicos da obra</p>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Dados da Obra */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white pb-2 border-b-2 border-blue-500/30">
                  Dados da Obra
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="edit-nome" className="text-gray-300">Nome da Obra *</Label>
                  <Input
                    id="edit-nome"
                    value={editFormData.nome}
                    onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                    placeholder="Ex: Casa da Praia"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-tipo" className="text-gray-300">Tipo *</Label>
                  <Select
                    value={editFormData.tipo}
                    onValueChange={(value) => setEditFormData({ ...editFormData, tipo: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="construcao">Construção</SelectItem>
                      <SelectItem value="reforma">Reforma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-area" className="text-gray-300">Área em m² *</Label>
                  <Input
                    id="edit-area"
                    type="text"
                    value={areaFormatada}
                    onChange={handleAreaChange}
                    placeholder="Ex: 1.020,50"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white pb-2 border-b-2 border-blue-500/30">
                  Localização
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-estado" className="text-gray-300">Estado *</Label>
                    <Select
                      value={editFormData.estado}
                      onValueChange={(value) => setEditFormData({ ...editFormData, estado: value })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {ESTADOS_BRASILEIROS.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="edit-cidade" className="text-gray-300">Cidade *</Label>
                    <Input
                      id="edit-cidade"
                      value={editFormData.cidade}
                      onChange={(e) => setEditFormData({ ...editFormData, cidade: e.target.value })}
                      placeholder="Ex: São Paulo"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-bairro" className="text-gray-300">Bairro</Label>
                  <Input
                    id="edit-bairro"
                    value={editFormData.bairro}
                    onChange={(e) => setEditFormData({ ...editFormData, bairro: e.target.value })}
                    placeholder="Ex: Jardins"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Orçamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white pb-2 border-b-2 border-blue-500/30">
                  Orçamento Estimado
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="edit-orcamento" className="text-gray-300">Orçamento Estimado</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      R$
                    </span>
                    <Input
                      id="edit-orcamento"
                      type="text"
                      value={orcamentoFormatado}
                      onChange={handleOrcamentoChange}
                      placeholder="0,00"
                      className="pl-12 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Prazo */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white pb-2 border-b-2 border-blue-500/30">
                  Prazo da Obra
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-dataInicio" className="text-gray-300">Data de Início</Label>
                    <Input
                      id="edit-dataInicio"
                      type="date"
                      value={editFormData.dataInicio}
                      onChange={(e) => setEditFormData({ ...editFormData, dataInicio: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-dataTermino" className="text-gray-300">Previsão de Término</Label>
                    <Input
                      id="edit-dataTermino"
                      type="date"
                      value={editFormData.dataTermino}
                      onChange={(e) => setEditFormData({ ...editFormData, dataTermino: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-[#1F2937] hover:bg-[#374151] text-white border-0"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-red-500/30">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Excluir obra?
            </h2>

            <p className="text-center text-gray-300 font-medium mb-4">
              {obra.nome}
            </p>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-300 text-center font-medium">
                ⚠️ Esta ação é irreversível
              </p>
              <p className="text-sm text-red-400 text-center mt-2">
                Todos os dados associados serão removidos permanentemente:
              </p>
              <ul className="text-sm text-red-400 mt-2 space-y-1">
                <li>• Despesas registradas</li>
                <li>• Profissionais cadastrados</li>
                <li>• Alertas configurados</li>
                <li>• Histórico completo</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="flex-1 bg-[#1F2937] hover:bg-[#374151] text-white border-0"
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  "Confirmar Exclusão"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
