"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Users, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { toast } from "sonner"
import { getPagamentosByProfissional, getActiveObraId } from "@/lib/storage"

interface Profissional {
  id: string
  obraId: string
  nome: string
  funcao: string
  telefone?: string
  observacoes?: string
  valorPrevisto?: number
  contrato?: {
    tipoCobranca: string
    valorCombinado: number
    quantidadeBase: number
    valorTotalPrevisto: number
    dataInicio?: string
    dataTermino?: string
    valorPrevisto?: number
  }
  pagamentos?: Array<{
    id: string
    data: string
    valor: number
    formaPagamento: string
    observacao?: string
  }>
  extras?: Array<{
    id: string
    data: string
    descricao: string
    valor: number
    status: "Pendente" | "Aprovado" | "Rejeitado"
    observacao?: string
  }>
  despesas?: Array<{
    id: string
    data: string
    descricao: string
    valor: number
    category: string
  }>
}

interface Obra {
  id: string
  nome: string
}

export default function ProfissionaisPage() {
  const router = useRouter()
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [obra, setObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [profissionalToDelete, setProfissionalToDelete] = useState<Profissional | null>(null)

  const carregarProfissionais = () => {
    const userData = localStorage.getItem("user")
    if (!userData) return []

    // USAR activeObraId
    const activeObraId = getActiveObraId()
    if (!activeObraId) {
      router.push("/obras")
      return []
    }

    const obrasExistentes = JSON.parse(localStorage.getItem("obras") || "[]")
    const obraAtiva = obrasExistentes.find((o: any) => o.id === activeObraId)
    
    if (!obraAtiva) {
      router.push("/obras")
      return []
    }

    setObra(obraAtiva)

    // Carregar profissionais da obra ativa
    const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]")
    const profissionaisObra = todosProfissionais.filter((p: Profissional) => p.obraId === activeObraId)
    
    return profissionaisObra
  }

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    const profissionaisCarregados = carregarProfissionais()
    setProfissionais(profissionaisCarregados)
    setLoading(false)
  }, [router])

  // Recarregar profissionais quando a página receber foco (volta de outra página)
  useEffect(() => {
    const handleFocus = () => {
      const profissionaisAtualizados = carregarProfissionais()
      setProfissionais(profissionaisAtualizados)
    }

    // Listener para mudanças no localStorage (quando pagamento é salvo em outra aba/página)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "despesas") {
        const profissionaisAtualizados = carregarProfissionais()
        setProfissionais(profissionaisAtualizados)
      }
    }

    // Listener para eventos customizados de pagamento
    const handlePagamentoSalvo = () => {
      const profissionaisAtualizados = carregarProfissionais()
      setProfissionais(profissionaisAtualizados)
    }

    const handlePagamentoAtualizado = () => {
      const profissionaisAtualizados = carregarProfissionais()
      setProfissionais(profissionaisAtualizados)
    }

    window.addEventListener("focus", handleFocus)
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("pagamentoSalvo", handlePagamentoSalvo as EventListener)
    window.addEventListener("pagamentoAtualizado", handlePagamentoAtualizado as EventListener)
    
    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("pagamentoSalvo", handlePagamentoSalvo as EventListener)
      window.removeEventListener("pagamentoAtualizado", handlePagamentoAtualizado as EventListener)
    }
  }, [])

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  const calcularValorPago = (profissional: Profissional): number => {
    // Buscar pagamentos diretamente do storage (fonte única de verdade)
    const pagamentos = getPagamentosByProfissional(profissional.obraId, profissional.id)
    return pagamentos.reduce((acc, p) => acc + p.valor, 0)
  }

  const calcularValorPrevisto = (profissional: Profissional): number => {
    // Priorizar valorPrevisto direto do profissional, depois do contrato
    return profissional.valorPrevisto || profissional.contrato?.valorPrevisto || profissional.contrato?.valorTotalPrevisto || 0
  }

  const calcularSaldoPagar = (profissional: Profissional): number => {
    const valorPrevisto = calcularValorPrevisto(profissional)
    const valorPago = calcularValorPago(profissional)
    return valorPrevisto - valorPago
  }

  const getCorSaldo = (saldo: number): string => {
    // REGRA CORRIGIDA: Azul/neutro se >= 0, vermelho se < 0
    return saldo < 0 ? "text-red-400" : "text-blue-400"
  }

  const handleOpenDeleteModal = (e: React.MouseEvent, profissional: Profissional) => {
    e.preventDefault()
    e.stopPropagation()
    setProfissionalToDelete(profissional)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setProfissionalToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!profissionalToDelete) return

    setExcluindo(profissionalToDelete.id)

    try {
      // Remover do localStorage
      const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]")
      const novosProfissionais = todosProfissionais.filter((p: Profissional) => p.id !== profissionalToDelete.id)
      localStorage.setItem("profissionais", JSON.stringify(novosProfissionais))
      
      // Atualizar estado local
      setProfissionais(profissionais.filter(p => p.id !== profissionalToDelete.id))
      
      handleCloseDeleteModal()
      toast.success("Profissional excluído com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir profissional:", error)
      toast.error("Erro ao excluir profissional. Tente novamente.")
    } finally {
      setExcluindo(null)
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Logo OBREASY */}
        <div className="mb-6">
          <Image
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/979b9040-0d37-4e0d-ae77-88fcfe603d77.png"
            alt="Logo OBREASY"
            width={120}
            height={120}
            className="h-12 w-auto"
            priority
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/obra")}
            className="mb-4 hover:bg-slate-800/50 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Profissionais
                </h1>
                {obra && (
                  <p className="text-sm text-gray-400">{obra.nome}</p>
                )}
              </div>
            </div>

            <Button
              onClick={() => router.push("/dashboard/profissionais/novo")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Profissional
            </Button>
          </div>
        </div>

        {profissionais.length === 0 ? (
          // Empty State
          <Card className="p-8 sm:p-12 bg-slate-900/60 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.3)]">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/15 rounded-full mb-6">
                <Users className="w-10 h-10 text-purple-400" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Nenhum profissional cadastrado
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Comece cadastrando o primeiro profissional para controlar pagamentos e serviços.
              </p>

              <Button
                size="lg"
                onClick={() => router.push("/dashboard/profissionais/novo")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Cadastrar primeiro profissional
              </Button>
            </div>
          </Card>
        ) : (
          // Lista de Profissionais - CAMADA INTERMEDIÁRIA
          <div className="grid grid-cols-1 gap-4">
            {profissionais.map((profissional) => {
              const valorPago = calcularValorPago(profissional)
              const valorPrevisto = calcularValorPrevisto(profissional)
              const saldoPagar = calcularSaldoPagar(profissional)

              return (
                <Card key={profissional.id} className="p-6 bg-slate-900/60 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.3)] hover:shadow-[0_6px_25px_rgb(0,0,0,0.35)] transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Informações do Profissional */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{profissional.nome}</h3>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 border">
                          {profissional.funcao}
                        </Badge>
                      </div>
                      
                      {profissional.telefone && (
                        <p className="text-sm text-gray-400 mb-3">{profissional.telefone}</p>
                      )}

                      {/* Valores */}
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Valor Previsto</p>
                          <p className="text-lg font-semibold text-white">
                            {valorPrevisto > 0 ? formatarMoeda(valorPrevisto) : "Não definido"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Valor Pago</p>
                          <p className="text-lg font-semibold text-green-400">
                            {formatarMoeda(valorPago)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Saldo a Pagar</p>
                          <p className={`text-lg font-semibold ${getCorSaldo(saldoPagar)}`}>
                            {formatarMoeda(saldoPagar)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex sm:flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/dashboard/profissionais/${profissional.id}`)}
                        className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/profissionais/${profissional.id}?edit=true`)}
                        className="border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white flex-1 sm:flex-none"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={(e) => handleOpenDeleteModal(e, profissional)}
                        disabled={excluindo === profissional.id}
                        className="border-red-600/50 text-red-400 hover:bg-red-950/30 hover:text-red-300 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && profissionalToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-slate-700">
            {/* Ícone de alerta */}
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-red-500/30">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Excluir profissional?
            </h2>

            {/* Nome do profissional */}
            <p className="text-center text-gray-300 font-medium mb-4">
              {profissionalToDelete.nome}
            </p>

            {/* Detalhes */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700/30">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Função</p>
                  <p className="font-semibold text-white">{profissionalToDelete.funcao}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valor Previsto</p>
                  <p className="font-semibold text-white">
                    {calcularValorPrevisto(profissionalToDelete) > 0 
                      ? formatarMoeda(calcularValorPrevisto(profissionalToDelete))
                      : "Não definido"}
                  </p>
                </div>
              </div>
            </div>

            {/* Texto de aviso */}
            <p className="text-gray-400 text-center mb-6">
              Esta ação é permanente e não pode ser desfeita.
            </p>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 px-4 py-3 border border-slate-600 rounded-lg font-medium text-gray-300 hover:bg-slate-700 transition-all"
                disabled={excluindo !== null}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={excluindo !== null}
              >
                {excluindo ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
