"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText, Save, X, Edit, Trash2, Plus, DollarSign } from "lucide-react"
import { goToObraDashboard } from "@/lib/navigation"
import { deletePagamento } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/custom/FileUpload"
import { toast } from "sonner"
import Image from "next/image"

interface Profissional {
  id: string
  obraId: string
  nome: string
  funcao: string
  telefone?: string
  observacoes?: string
  valorPrevisto?: number
  contrato?: {
    tipoContrato: string
    dataInicio?: string
    dataTermino?: string
    observacoes?: string
    valorPrevisto: number
    valorCombinado?: number
    diaria?: number
    qtdDiarias?: number
    valorM2?: number
    areaM2?: number
    valorUnidade?: number
    qtdUnidades?: number
    etapas?: Array<{ nome: string; valor: number }>
    anexo?: string | null
  }
}

interface Despesa {
  id: string
  obraId: string
  data: string
  valor: number
  categoria?: string
  category?: string
  descricao?: string
  formaPagamento?: string
  observacao?: string
  profissionalId?: string
  anexo?: string | null
}

interface Obra {
  id: string
  nome: string
}

export default function ProfissionalDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [profissional, setProfissional] = useState<Profissional | null>(null)
  const [obra, setObra] = useState<Obra | null>(null)
  const [pagamentos, setPagamentos] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingContrato, setIsEditingContrato] = useState(false)
  const [modalNovoPagamento, setModalNovoPagamento] = useState(false)
  const [modalEditarPagamento, setModalEditarPagamento] = useState(false)
  const [pagamentoEditando, setPagamentoEditando] = useState<string | null>(null)
  const [valorCombinadoFormatado, setValorCombinadoFormatado] = useState("")
  const [valorDiariaFormatado, setValorDiariaFormatado] = useState("")
  const [valorM2Formatado, setValorM2Formatado] = useState("")
  const [excluindoContrato, setExcluindoContrato] = useState(false)
  const [excluindoPagamento, setExcluindoPagamento] = useState<string | null>(null)
  const [showDeleteContratoModal, setShowDeleteContratoModal] = useState(false)
  const [showDeletePagamentoModal, setShowDeletePagamentoModal] = useState(false)
  const [pagamentoToDelete, setPagamentoToDelete] = useState<Despesa | null>(null)
  const [etapasFormatadas, setEtapasFormatadas] = useState<string[]>([])
  const [anexoContrato, setAnexoContrato] = useState<string | null>(null)
  const [anexoPagamento, setAnexoPagamento] = useState<string | null>(null)
  const [anexoPagamentoEditar, setAnexoPagamentoEditar] = useState<string | null>(null)
  
  const [editForm, setEditForm] = useState({
    nome: "",
    funcao: "",
    telefone: "",
    observacoes: "",
    contrato: {
      tipoContrato: "",
      dataInicio: "",
      dataTermino: "",
      observacoes: "",
      valorPrevisto: 0,
      valorCombinado: 0,
      diaria: 0,
      qtdDiarias: 0,
      valorM2: 0,
      areaM2: 0,
      valorUnidade: 0,
      qtdUnidades: 0,
      etapas: [] as Array<{ nome: string; valor: number }>,
      anexo: null as string | null
    }
  })

  const [novoPagamentoForm, setNovoPagamentoForm] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: "",
    valorFormatado: "",
    formaPagamento: "dinheiro",
    observacao: "",
    anexo: null as string | null
  })

  const [editarPagamentoForm, setEditarPagamentoForm] = useState({
    data: "",
    valor: "",
    valorFormatado: "",
    formaPagamento: "",
    observacao: "",
    anexo: null as string | null
  })

  const carregarPagamentos = () => {
    const todasDespesas = JSON.parse(localStorage.getItem("despesas") || "[]")
    const despesasDoProfissional = todasDespesas.filter((d: Despesa) => {
      const category = String(d.category ?? d.categoria ?? "").toLowerCase()
      const profId = (d as any).professionalId || d.profissionalId
      return profId === id && (category === "mao_obra" || category === "mão de obra")
    })
    setPagamentos(despesasDoProfissional)
  }

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]")
    const prof = todosProfissionais.find((p: Profissional) => p.id === id)
    if (!prof) {
      router.push("/dashboard/profissionais")
      return
    }

    setProfissional(prof)

    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      const obrasExistentes = JSON.parse(localStorage.getItem("obras") || "[]")
      const obraEncontrada = obrasExistentes.find((o: any) => o.id === prof.obraId && o.userId === user.email)
      if (obraEncontrada) {
        setObra(obraEncontrada)
      }
    }

    setEditForm({
      nome: prof.nome,
      funcao: prof.funcao,
      telefone: prof.telefone || "",
      observacoes: prof.observacoes || "",
      contrato: prof.contrato || {
        tipoContrato: "",
        dataInicio: "",
        dataTermino: "",
        observacoes: "",
        valorPrevisto: 0,
        valorCombinado: 0,
        diaria: 0,
        qtdDiarias: 0,
        valorM2: 0,
        areaM2: 0,
        valorUnidade: 0,
        qtdUnidades: 0,
        etapas: [],
        anexo: null
      }
    })

    if (prof.contrato?.valorCombinado) {
      setValorCombinadoFormatado(formatarMoeda(prof.contrato.valorCombinado))
    }
    if (prof.contrato?.diaria) {
      setValorDiariaFormatado(formatarMoeda(prof.contrato.diaria))
    }
    if (prof.contrato?.valorM2) {
      setValorM2Formatado(formatarMoeda(prof.contrato.valorM2))
    }
    if (prof.contrato?.etapas) {
      setEtapasFormatadas(prof.contrato.etapas.map(e => formatarMoeda(e.valor)))
    }
    if (prof.contrato?.anexo) {
      setAnexoContrato(prof.contrato.anexo)
    }

    carregarPagamentos()
    setLoading(false)
  }, [id, router])

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  const formatarMoedaInput = (valor: string): string => {
    const numero = valor.replace(/\D/g, "")
    if (!numero) return ""
    const valorNumerico = Number(numero) / 100
    return valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  const converterMoedaParaNumero = (valorFormatado: string): number => {
    const numero = valorFormatado
      .replace(/R\$/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".")
    return Number(numero) || 0
  }

  const calcularValorPago = (): number => {
    return pagamentos.reduce((acc, p) => acc + p.valor, 0)
  }

  const calcularValorPrevisto = (): number => {
    return profissional?.valorPrevisto || profissional?.contrato?.valorPrevisto || 0
  }

  const calcularSaldoPagar = (): number => {
    const valorPrevisto = calcularValorPrevisto()
    const valorPago = calcularValorPago()
    return valorPrevisto - valorPago
  }

  const getCorSaldo = (saldo: number): string => {
    return saldo < 0 ? "text-red-600" : "text-blue-600"
  }

  const calcularValorPrevistoContrato = (contrato: typeof editForm.contrato): number => {
    switch (contrato.tipoContrato) {
      case "empreitada":
        return contrato.valorCombinado || 0
      case "diaria":
        return (contrato.diaria || 0) * (contrato.qtdDiarias || 0)
      case "por_m2":
        return (contrato.valorM2 || 0) * (contrato.areaM2 || 0)
      case "por_etapa":
        return contrato.etapas?.reduce((acc, e) => acc + (e.valor || 0), 0) || 0
      default:
        return 0
    }
  }

  const handleContratoChange = (field: string, value: any) => {
    const updatedContrato = { ...editForm.contrato, [field]: value }
    const valorPrevisto = calcularValorPrevistoContrato(updatedContrato)
    setEditForm({
      ...editForm,
      contrato: { ...updatedContrato, valorPrevisto }
    })
  }

  const handleValorCombinadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoedaInput(e.target.value)
    setValorCombinadoFormatado(valorFormatado)
    const valorNumerico = converterMoedaParaNumero(valorFormatado)
    handleContratoChange("valorCombinado", valorNumerico)
  }

  const handleValorDiariaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoedaInput(e.target.value)
    setValorDiariaFormatado(valorFormatado)
    const valorNumerico = converterMoedaParaNumero(valorFormatado)
    handleContratoChange("diaria", valorNumerico)
  }

  const handleValorM2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoedaInput(e.target.value)
    setValorM2Formatado(valorFormatado)
    const valorNumerico = converterMoedaParaNumero(valorFormatado)
    handleContratoChange("valorM2", valorNumerico)
  }

  const handleEtapaValorChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoedaInput(e.target.value)
    const novasEtapasFormatadas = [...etapasFormatadas]
    novasEtapasFormatadas[index] = valorFormatado
    setEtapasFormatadas(novasEtapasFormatadas)
    
    const valorNumerico = converterMoedaParaNumero(valorFormatado)
    const newEtapas = [...editForm.contrato.etapas!]
    newEtapas[index].valor = valorNumerico
    handleContratoChange("etapas", newEtapas)
  }

  const handleSalvar = async () => {
    try {
      const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]")
      const index = todosProfissionais.findIndex((p: Profissional) => p.id === id)
      if (index === -1) throw new Error("Profissional não encontrado")

      const profissionalAtualizado = {
        ...todosProfissionais[index],
        nome: editForm.nome,
        funcao: editForm.funcao,
        telefone: editForm.telefone,
        observacoes: editForm.observacoes,
        contrato: editForm.contrato
      }

      todosProfissionais[index] = profissionalAtualizado
      localStorage.setItem("profissionais", JSON.stringify(todosProfissionais))

      setProfissional(profissionalAtualizado)
      setIsEditing(false)
      toast.success("Profissional salvo com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar profissional:", error)
      toast.error("Erro ao salvar profissional")
    }
  }

  const validarContrato = (): boolean => {
    if (!editForm.contrato.tipoContrato) {
      toast.error("Selecione o tipo de contrato")
      return false
    }
    switch (editForm.contrato.tipoContrato) {
      case "empreitada":
        if (!editForm.contrato.valorCombinado || editForm.contrato.valorCombinado <= 0) {
          toast.error("Informe o valor combinado")
          return false
        }
        break
      case "diaria":
        if (!editForm.contrato.diaria || editForm.contrato.diaria <= 0) {
          toast.error("Informe o valor da diária")
          return false
        }
        if (!editForm.contrato.qtdDiarias || editForm.contrato.qtdDiarias <= 0) {
          toast.error("Informe a quantidade de diárias")
          return false
        }
        break
      case "por_m2":
        if (!editForm.contrato.valorM2 || editForm.contrato.valorM2 <= 0) {
          toast.error("Informe o valor por m²")
          return false
        }
        if (!editForm.contrato.areaM2 || editForm.contrato.areaM2 <= 0) {
          toast.error("Informe a área em m²")
          return false
        }
        break
      case "por_etapa":
        if (!editForm.contrato.etapas || editForm.contrato.etapas.length === 0) {
          toast.error("Adicione pelo menos uma etapa")
          return false
        }
        break
    }
    return true
  }

  const handleSalvarContrato = async () => {
    if (!validarContrato()) return

    try {
      const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]")
      const index = todosProfissionais.findIndex((p: Profissional) => p.id === id)
      if (index === -1) throw new Error("Profissional não encontrado")

      const valorPrevistoContrato = calcularValorPrevistoContrato(editForm.contrato)

      const profissionalAtualizado = {
        ...todosProfissionais[index],
        contrato: {
          ...editForm.contrato,
          valorPrevisto: valorPrevistoContrato,
          anexo: anexoContrato
        },
        valorPrevisto: valorPrevistoContrato
      }

      todosProfissionais[index] = profissionalAtualizado
      localStorage.setItem("profissionais", JSON.stringify(todosProfissionais))

      setProfissional(profissionalAtualizado)
      setIsEditingContrato(false)
      toast.success("Contrato salvo com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar contrato:", error)
      toast.error("Erro ao salvar contrato")
    }
  }

  const handleOpenDeleteContratoModal = () => {
    setShowDeleteContratoModal(true)
  }

  const handleCloseDeleteContratoModal = () => {
    setShowDeleteContratoModal(false)
  }

  const handleConfirmDeleteContrato = async () => {
    if (!profissional) {
      toast.error("Profissional não encontrado")
      return
    }

    setExcluindoContrato(true)

    try {
      const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]")
      const index = todosProfissionais.findIndex((p: Profissional) => p.id === id)
      
      if (index === -1) {
        toast.error("Profissional não encontrado")
        return
      }

      const profissionalAtualizado = {
        ...todosProfissionais[index],
        contrato: undefined,
        valorPrevisto: 0
      }

      todosProfissionais[index] = profissionalAtualizado
      localStorage.setItem("profissionais", JSON.stringify(todosProfissionais))

      setProfissional(profissionalAtualizado)
      setEditForm({
        ...editForm,
        contrato: {
          tipoContrato: "",
          dataInicio: "",
          dataTermino: "",
          observacoes: "",
          valorPrevisto: 0,
          valorCombinado: 0,
          diaria: 0,
          qtdDiarias: 0,
          valorM2: 0,
          areaM2: 0,
          valorUnidade: 0,
          qtdUnidades: 0,
          etapas: [],
          anexo: null
        }
      })
      setValorCombinadoFormatado("")
      setValorDiariaFormatado("")
      setValorM2Formatado("")
      setEtapasFormatadas([])
      setAnexoContrato(null)
      
      handleCloseDeleteContratoModal()
      toast.success("Contrato excluído com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir contrato:", error)
      toast.error("Erro ao excluir contrato. Tente novamente.")
    } finally {
      setExcluindoContrato(false)
    }
  }

  const handleOpenDeletePagamentoModal = (pagamento: Despesa) => {
    setPagamentoToDelete(pagamento)
    setShowDeletePagamentoModal(true)
  }

  const handleCloseDeletePagamentoModal = () => {
    setShowDeletePagamentoModal(false)
    setPagamentoToDelete(null)
  }

  const handleConfirmDeletePagamento = async () => {
    if (!pagamentoToDelete) return

    setExcluindoPagamento(pagamentoToDelete.id)

    try {
      const sucesso = deletePagamento(obra?.id || "", id, pagamentoToDelete.id)
      
      if (sucesso) {
        toast.success("Pagamento excluído com sucesso!")
        carregarPagamentos()
        handleCloseDeletePagamentoModal()
        
        window.dispatchEvent(new CustomEvent("pagamentoAtualizado", { detail: { profissionalId: id } }))
      } else {
        toast.error("Erro ao excluir pagamento. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao excluir pagamento:", error)
      toast.error("Erro ao excluir pagamento. Tente novamente.")
    } finally {
      setExcluindoPagamento(null)
    }
  }

  const handleAbrirModalNovoPagamento = () => {
    setNovoPagamentoForm({
      data: new Date().toISOString().split('T')[0],
      valor: "",
      valorFormatado: "",
      formaPagamento: "dinheiro",
      observacao: "",
      anexo: null
    })
    setAnexoPagamento(null)
    setModalNovoPagamento(true)
  }

  const handleAbrirModalEditarPagamento = (pagamento: Despesa) => {
    setPagamentoEditando(pagamento.id)
    setEditarPagamentoForm({
      data: pagamento.data,
      valor: String(pagamento.valor),
      valorFormatado: formatarMoeda(pagamento.valor),
      formaPagamento: pagamento.formaPagamento || "dinheiro",
      observacao: pagamento.observacao || "",
      anexo: pagamento.anexo || null
    })
    setAnexoPagamentoEditar(pagamento.anexo || null)
    setModalEditarPagamento(true)
  }

  const handleValorPagamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoedaInput(e.target.value)
    setNovoPagamentoForm({
      ...novoPagamentoForm,
      valorFormatado,
      valor: String(converterMoedaParaNumero(valorFormatado))
    })
  }

  const handleValorEditarPagamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoedaInput(e.target.value)
    setEditarPagamentoForm({
      ...editarPagamentoForm,
      valorFormatado,
      valor: String(converterMoedaParaNumero(valorFormatado))
    })
  }

  const validarNovoPagamento = (): boolean => {
    if (!novoPagamentoForm.data) {
      toast.error("Informe a data do pagamento")
      return false
    }
    const valorNumerico = Number(novoPagamentoForm.valor ?? 0)
    if (!valorNumerico || valorNumerico <= 0) {
      toast.error("Informe um valor válido maior que zero")
      return false
    }
    return true
  }

  const validarEditarPagamento = (): boolean => {
    if (!editarPagamentoForm.data) {
      toast.error("Informe a data do pagamento")
      return false
    }
    const valorNumerico = Number(editarPagamentoForm.valor ?? 0)
    if (!valorNumerico || valorNumerico <= 0) {
      toast.error("Informe um valor válido maior que zero")
      return false
    }
    return true
  }

  const handleSalvarNovoPagamento = async () => {
    if (!validarNovoPagamento()) return
    if (!profissional) return

    try {
      const todasDespesas = JSON.parse(localStorage.getItem("despesas") || "[]")

      const novaDespesa: Despesa = {
        id: `desp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        obraId: profissional.obraId,
        data: novoPagamentoForm.data,
        valor: Number(novoPagamentoForm.valor),
        categoria: "Mão de Obra",
        category: "mao_obra",
        descricao: `Pagamento - ${profissional.nome}`,
        formaPagamento: novoPagamentoForm.formaPagamento,
        observacao: novoPagamentoForm.observacao || undefined,
        profissionalId: profissional.id,
        anexo: anexoPagamento
      }

      todasDespesas.push(novaDespesa)
      localStorage.setItem("despesas", JSON.stringify(todasDespesas))

      window.dispatchEvent(new CustomEvent("pagamentoSalvo", { detail: { profissionalId: profissional.id } }))

      carregarPagamentos()
      setModalNovoPagamento(false)
      toast.success("Pagamento registrado com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar pagamento:", error)
      toast.error("Erro ao salvar pagamento")
    }
  }

  const handleSalvarEditarPagamento = async () => {
    if (!validarEditarPagamento()) return
    if (!profissional || !pagamentoEditando) return

    try {
      const todasDespesas = JSON.parse(localStorage.getItem("despesas") || "[]")
      const index = todasDespesas.findIndex((d: Despesa) => d.id === pagamentoEditando)
      
      if (index === -1) throw new Error("Pagamento não encontrado")

      todasDespesas[index] = {
        ...todasDespesas[index],
        data: editarPagamentoForm.data,
        valor: Number(editarPagamentoForm.valor),
        formaPagamento: editarPagamentoForm.formaPagamento,
        observacao: editarPagamentoForm.observacao || undefined,
        anexo: anexoPagamentoEditar
      }

      localStorage.setItem("despesas", JSON.stringify(todasDespesas))

      window.dispatchEvent(new CustomEvent("pagamentoAtualizado", { detail: { profissionalId: profissional.id } }))

      carregarPagamentos()
      setModalEditarPagamento(false)
      setPagamentoEditando(null)
      toast.success("Pagamento atualizado com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error)
      toast.error("Erro ao atualizar pagamento")
    }
  }

  if (loading || !profissional) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  const valorPago = calcularValorPago()
  const valorPrevisto = calcularValorPrevisto()
  const saldoPagar = calcularSaldoPagar()

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Image
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/979b9040-0d37-4e0d-ae77-88fcfe603d77.png"
            alt="Logo OBREASY"
            width={120}
            height={120}
            className="h-12 w-auto"
            priority
          />
        </div>

        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/profissionais")}
            className="mb-6 hover:bg-slate-800/50 text-gray-300 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Profissionais
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {profissional.nome}
              </h1>
              {obra && (
                <p className="text-base text-gray-400">{obra.nome}</p>
              )}
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg h-12 rounded-xl"
            >
              <Edit className="w-5 h-5 mr-2" />
              {isEditing ? "Cancelar Edição" : "Editar Profissional"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <Card className="p-8 bg-slate-800/50 border border-slate-700/30 shadow-lg rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Informações Gerais
            </h2>

            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="nome" className="text-sm text-gray-300 font-medium">Nome</Label>
                    <Input
                      id="nome"
                      value={editForm.nome}
                      onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                      className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="funcao" className="text-sm text-gray-300 font-medium">Função</Label>
                    <Input
                      id="funcao"
                      value={editForm.funcao}
                      onChange={(e) => setEditForm({...editForm, funcao: e.target.value})}
                      className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="telefone" className="text-sm text-gray-300 font-medium">Telefone</Label>
                  <Input
                    id="telefone"
                    value={editForm.telefone}
                    onChange={(e) => setEditForm({...editForm, telefone: e.target.value})}
                    className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="observacoes" className="text-sm text-gray-300 font-medium">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={editForm.observacoes}
                    onChange={(e) => setEditForm({...editForm, observacoes: e.target.value})}
                    rows={4}
                    className="bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                  <Button onClick={handleSalvar} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 rounded-xl">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={() => setIsEditing(false)} className="bg-slate-800 hover:bg-slate-700 text-gray-300 border-2 border-slate-600 h-12 rounded-xl">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nome</p>
                    <p className="font-semibold text-white">{profissional.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Função</p>
                    <p className="font-semibold text-white">{profissional.funcao}</p>
                  </div>
                </div>

                {profissional.telefone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Telefone</p>
                    <p className="font-semibold text-white">{profissional.telefone}</p>
                  </div>
                )}

                {profissional.observacoes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Observações</p>
                    <p className="font-semibold text-white">{profissional.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Resumo Financeiro */}
          <Card className="p-8 bg-slate-800/50 border border-slate-700/30 shadow-lg rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Resumo Financeiro
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Valor Previsto</p>
                <p className="text-2xl font-bold text-white">
                  {valorPrevisto > 0 ? formatarMoeda(valorPrevisto) : "Não definido"}
                </p>
              </div>
              <div className="text-center p-4 bg-green-900/30 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Valor Pago</p>
                <p className="text-2xl font-bold text-green-400">{formatarMoeda(valorPago)}</p>
              </div>
              <div className="text-center p-4 bg-blue-900/30 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Saldo a Pagar</p>
                <p className={`text-2xl font-bold ${saldoPagar < 0 ? 'text-red-400' : 'text-blue-400'}`}>{formatarMoeda(saldoPagar)}</p>
              </div>
            </div>
          </Card>

          {/* Contrato / Combinado */}
          <Card className="p-8 bg-slate-800/50 border border-slate-700/30 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Contrato / Combinado
              </h2>
              <Button onClick={() => {
                setIsEditingContrato(true)
                if (editForm.contrato.valorCombinado) {
                  setValorCombinadoFormatado(formatarMoeda(editForm.contrato.valorCombinado))
                }
                if (editForm.contrato.diaria) {
                  setValorDiariaFormatado(formatarMoeda(editForm.contrato.diaria))
                }
                if (editForm.contrato.valorM2) {
                  setValorM2Formatado(formatarMoeda(editForm.contrato.valorM2))
                }
                if (editForm.contrato.etapas) {
                  setEtapasFormatadas(editForm.contrato.etapas.map(e => formatarMoeda(e.valor)))
                }
                if (editForm.contrato.anexo) {
                  setAnexoContrato(editForm.contrato.anexo)
                }
              }} size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-10 rounded-xl">
                {profissional.contrato ? "Editar" : "Definir"}
              </Button>
            </div>

            {isEditingContrato ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="tipoContrato" className="text-sm text-gray-300 font-medium">Tipo de Contrato</Label>
                  <Select
                    value={editForm.contrato.tipoContrato}
                    onValueChange={(value) => handleContratoChange("tipoContrato", value)}
                  >
                    <SelectTrigger className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="empreitada">Empreitada (valor fechado)</SelectItem>
                      <SelectItem value="diaria">Diária</SelectItem>
                      <SelectItem value="por_m2">Por m²</SelectItem>
                      <SelectItem value="por_etapa">Por etapa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editForm.contrato.tipoContrato === "empreitada" && (
                  <div className="space-y-3">
                    <Label htmlFor="valorCombinado" className="text-sm text-gray-300 font-medium">Valor Combinado</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        R$
                      </span>
                      <Input
                        id="valorCombinado"
                        type="text"
                        value={valorCombinadoFormatado}
                        onChange={handleValorCombinadoChange}
                        placeholder="0,00"
                        className="h-12 pl-14 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                )}

                {editForm.contrato.tipoContrato === "diaria" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="diaria" className="text-sm text-gray-300 font-medium">Valor da Diária</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                          R$
                        </span>
                        <Input
                          id="diaria"
                          type="text"
                          value={valorDiariaFormatado}
                          onChange={handleValorDiariaChange}
                          placeholder="0,00"
                          className="h-12 pl-14 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="qtdDiarias" className="text-sm text-gray-300 font-medium">Quantidade de Diárias Previstas</Label>
                      <Input
                        id="qtdDiarias"
                        type="number"
                        min="0"
                        step="1"
                        value={editForm.contrato.qtdDiarias || ""}
                        onChange={(e) => handleContratoChange("qtdDiarias", Number(e.target.value))}
                        placeholder="0"
                        className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {editForm.contrato.tipoContrato === "por_m2" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="valorM2" className="text-sm text-gray-300 font-medium">Valor por m²</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                          R$
                        </span>
                        <Input
                          id="valorM2"
                          type="text"
                          value={valorM2Formatado}
                          onChange={handleValorM2Change}
                          placeholder="0,00"
                          className="h-12 pl-14 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="areaM2" className="text-sm text-gray-300 font-medium">Área (m²)</Label>
                      <div className="relative">
                        <Input
                          id="areaM2"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.contrato.areaM2 || ""}
                          onChange={(e) => handleContratoChange("areaM2", Number(e.target.value))}
                          placeholder="0"
                          className="h-12 pr-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                          m²
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {editForm.contrato.tipoContrato === "por_etapa" && (
                  <div className="space-y-4">
                    <Label className="text-sm text-gray-300 font-medium">Etapas</Label>
                    {editForm.contrato.etapas?.map((etapa, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          placeholder="Nome da etapa"
                          value={etapa.nome}
                          onChange={(e) => {
                            const newEtapas = [...editForm.contrato.etapas!]
                            newEtapas[index].nome = e.target.value
                            handleContratoChange("etapas", newEtapas)
                          }}
                          className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                            R$
                          </span>
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={etapasFormatadas[index] || ""}
                            onChange={(e) => handleEtapaValorChange(index, e)}
                            className="h-12 pl-14 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newEtapas = [...(editForm.contrato.etapas || []), { nome: "", valor: 0 }]
                        handleContratoChange("etapas", newEtapas)
                        setEtapasFormatadas([...etapasFormatadas, ""])
                      }}
                      className="border-slate-600 text-gray-300 hover:bg-slate-800/50 h-12 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Etapa
                    </Button>
                  </div>
                )}

                {editForm.contrato.tipoContrato && (
                  <div className="space-y-3">
                    <Label className="text-sm text-gray-300 font-medium">Valor Previsto</Label>
                    <Input
                      value={formatarMoeda(editForm.contrato.valorPrevisto)}
                      readOnly
                      className="h-12 bg-slate-900/70 border-slate-600 text-white rounded-xl"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="dataInicio" className="text-sm text-gray-300 font-medium">Data de Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={editForm.contrato.dataInicio}
                      onChange={(e) => handleContratoChange("dataInicio", e.target.value)}
                      className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="dataTermino" className="text-sm text-gray-300 font-medium">Data de Término</Label>
                    <Input
                      id="dataTermino"
                      type="date"
                      value={editForm.contrato.dataTermino}
                      onChange={(e) => handleContratoChange("dataTermino", e.target.value)}
                      className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="observacoesContrato" className="text-sm text-gray-300 font-medium">Observações</Label>
                  <Textarea
                    id="observacoesContrato"
                    value={editForm.contrato.observacoes}
                    onChange={(e) => handleContratoChange("observacoes", e.target.value)}
                    rows={4}
                    className="bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Campo de Anexo do Contrato */}
                <FileUpload
                  label="Anexar contrato / combinado"
                  value={anexoContrato}
                  onChange={(file, preview) => setAnexoContrato(preview)}
                />

                <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                  <Button onClick={handleSalvarContrato} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 rounded-xl">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Contrato
                  </Button>
                  <Button onClick={() => setIsEditingContrato(false)} className="bg-slate-800 hover:bg-slate-700 text-gray-300 border-2 border-slate-600 h-12 rounded-xl">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              profissional.contrato ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tipo de Contrato</p>
                      <p className="font-semibold text-white">
                        {profissional.contrato.tipoContrato === "empreitada" ? "Empreitada (valor fechado)" :
                         profissional.contrato.tipoContrato === "diaria" ? "Diária" :
                         profissional.contrato.tipoContrato === "por_m2" ? "Por m²" :
                         profissional.contrato.tipoContrato === "por_etapa" ? "Por etapa" : profissional.contrato.tipoContrato}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Valor Previsto</p>
                      <p className="font-semibold text-white">{formatarMoeda(profissional.contrato.valorPrevisto)}</p>
                    </div>
                  </div>

                  {(profissional.contrato.dataInicio || profissional.contrato.dataTermino) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-700/50">
                      {profissional.contrato.dataInicio && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Data de Início</p>
                          <p className="font-semibold text-white">
                            {new Date(profissional.contrato.dataInicio).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                      {profissional.contrato.dataTermino && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Data de Término</p>
                          <p className="font-semibold text-white">
                            {new Date(profissional.contrato.dataTermino).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {profissional.contrato.observacoes && (
                    <div className="pt-4 border-t border-slate-700/50">
                      <p className="text-sm text-gray-500 mb-1">Observações</p>
                      <p className="font-semibold text-white">{profissional.contrato.observacoes}</p>
                    </div>
                  )}

                  {profissional.contrato.anexo && (
                    <div className="pt-4 border-t border-slate-700/50">
                      <p className="text-sm text-gray-500 mb-2">Contrato Anexado</p>
                      <Button
                        onClick={() => window.open(profissional.contrato!.anexo!, '_blank')}
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-900/20 h-10 rounded-xl"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Visualizar Contrato
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-gray-500 italic">
                      💡 Se houver alteração de escopo ou reorçamento, você pode ajustar este contrato pelo botão Editar.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <Button
                      onClick={handleOpenDeleteContratoModal}
                      disabled={excluindoContrato}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 h-12 rounded-xl"
                    >
                      <Trash2 className={`w-4 h-4 mr-2 ${excluindoContrato ? 'animate-pulse' : ''}`} />
                      {excluindoContrato ? "Excluindo..." : "Excluir contrato/combinado"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum contrato definido</p>
                </div>
              )
            )}
          </Card>

          {/* Pagamentos */}
          <Card className="p-8 bg-slate-800/50 border border-slate-700/30 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                Pagamentos
              </h2>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-10 rounded-xl"
                onClick={handleAbrirModalNovoPagamento}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Pagamento
              </Button>
            </div>

            {pagamentos.length > 0 ? (
              <div className="space-y-4">
                {pagamentos
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((pagamento) => (
                  <div 
                    key={pagamento.id} 
                    className={`flex items-center justify-between p-6 border border-slate-700/50 rounded-xl transition-all duration-200 ${
                      excluindoPagamento === pagamento.id ? 'opacity-50 scale-95' : 'hover:bg-slate-900/30 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-white text-lg">{formatarMoeda(pagamento.valor)}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(pagamento.data).toLocaleDateString('pt-BR')} - {pagamento.formaPagamento || "Não informado"}
                      </p>
                      {pagamento.observacao && (
                        <p className="text-sm text-gray-500 mt-2">{pagamento.observacao}</p>
                      )}
                      {pagamento.anexo && (
                        <Button
                          onClick={() => window.open(pagamento.anexo!, '_blank')}
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-8 px-2"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Ver comprovante
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAbrirModalEditarPagamento(pagamento)}
                        disabled={excluindoPagamento === pagamento.id}
                        className="border-blue-600 text-blue-400 hover:bg-blue-900/20 disabled:opacity-50 transition-all duration-200 h-10 rounded-xl"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDeletePagamentoModal(pagamento)}
                        disabled={excluindoPagamento === pagamento.id}
                        className="border-red-600 text-red-400 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 h-10 rounded-xl"
                      >
                        <Trash2 className={`w-4 h-4 ${excluindoPagamento === pagamento.id ? 'animate-pulse' : ''}`} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum pagamento registrado</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal Novo Pagamento */}
      {modalNovoPagamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Novo Pagamento</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="dataPagamento" className="text-sm text-gray-300 font-medium">Data do Pagamento</Label>
                <Input
                  id="dataPagamento"
                  type="date"
                  value={novoPagamentoForm.data}
                  onChange={(e) => setNovoPagamentoForm({...novoPagamentoForm, data: e.target.value})}
                  className="h-12 bg-slate-800/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="valorPagamento" className="text-sm text-gray-300 font-medium">Valor</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    R$
                  </span>
                  <Input
                    id="valorPagamento"
                    type="text"
                    value={novoPagamentoForm.valorFormatado}
                    onChange={handleValorPagamentoChange}
                    placeholder="0,00"
                    className="h-12 pl-14 bg-slate-800/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="formaPagamento" className="text-sm text-gray-300 font-medium">Forma de Pagamento</Label>
                <Select
                  value={novoPagamentoForm.formaPagamento}
                  onValueChange={(value) => setNovoPagamentoForm({...novoPagamentoForm, formaPagamento: value})}
                >
                  <SelectTrigger className="h-12 bg-slate-800/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="observacaoPagamento" className="text-sm text-gray-300 font-medium">Observação (opcional)</Label>
                <Textarea
                  id="observacaoPagamento"
                  value={novoPagamentoForm.observacao}
                  onChange={(e) => setNovoPagamentoForm({...novoPagamentoForm, observacao: e.target.value})}
                  rows={4}
                  placeholder="Ex: Pagamento referente à primeira etapa"
                  className="bg-slate-800/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Campo de Anexo do Pagamento */}
              <FileUpload
                label="Anexar comprovante de pagamento"
                value={anexoPagamento}
                onChange={(file, preview) => setAnexoPagamento(preview)}
              />

              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <Button 
                  onClick={handleSalvarNovoPagamento}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar pagamento
                </Button>
                <Button 
                  onClick={() => setModalNovoPagamento(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 border-2 border-slate-600 h-12 rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Pagamento */}
      {modalEditarPagamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Editar Pagamento</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="dataEditarPagamento" className="text-sm text-gray-300 font-medium">Data do Pagamento</Label>
                <Input
                  id="dataEditarPagamento"
                  type="date"
                  value={editarPagamentoForm.data}
                  onChange={(e) => setEditarPagamentoForm({...editarPagamentoForm, data: e.target.value})}
                  className="h-12 bg-slate-800/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="valorEditarPagamento" className="text-sm text-gray-300 font-medium">Valor</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    R$
                  </span>
                  <Input
                    id="valorEditarPagamento"
                    type="text"
                    value={editarPagamentoForm.valorFormatado}
                    onChange={handleValorEditarPagamentoChange}
                    placeholder="0,00"
                    className="h-12 pl-14 bg-slate-800/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="formaEditarPagamento" className="text-sm text-gray-300 font-medium">Forma de Pagamento</Label>
                <Select
                  value={editarPagamentoForm.formaPagamento}
                  onValueChange={(value) => setEditarPagamentoForm({...editarPagamentoForm, formaPagamento: value})}
                >
                  <SelectTrigger className="h-12 bg-slate-800/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="observacaoEditarPagamento" className="text-sm text-gray-300 font-medium">Observação (opcional)</Label>
                <Textarea
                  id="observacaoEditarPagamento"
                  value={editarPagamentoForm.observacao}
                  onChange={(e) => setEditarPagamentoForm({...editarPagamentoForm, observacao: e.target.value})}
                  rows={4}
                  placeholder="Ex: Pagamento referente à primeira etapa"
                  className="bg-slate-800/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Campo de Anexo do Pagamento Editar */}
              <FileUpload
                label="Anexar comprovante de pagamento"
                value={anexoPagamentoEditar}
                onChange={(file, preview) => setAnexoPagamentoEditar(preview)}
              />

              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <Button 
                  onClick={handleSalvarEditarPagamento}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar alterações
                </Button>
                <Button 
                  onClick={() => {
                    setModalEditarPagamento(false)
                    setPagamentoEditando(null)
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 border-2 border-slate-600 h-12 rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão de contrato */}
      {showDeleteContratoModal && profissional.contrato && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 border border-slate-700">
            <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Excluir contrato?
            </h2>

            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="font-semibold text-white">
                    {profissional.contrato.tipoContrato === "empreitada" ? "Empreitada" :
                     profissional.contrato.tipoContrato === "diaria" ? "Diária" :
                     profissional.contrato.tipoContrato === "por_m2" ? "Por m²" :
                     profissional.contrato.tipoContrato === "por_etapa" ? "Por etapa" : profissional.contrato.tipoContrato}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valor Previsto</p>
                  <p className="font-semibold text-white">{formatarMoeda(profissional.contrato.valorPrevisto)}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-center mb-6">
              Esta ação é permanente e removerá todas as informações do contrato.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCloseDeleteContratoModal}
                className="flex-1 px-4 py-3 border border-slate-600 rounded-xl font-medium text-gray-300 hover:bg-slate-800/50 transition-all"
                disabled={excluindoContrato}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteContrato}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={excluindoContrato}
              >
                {excluindoContrato ? (
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

      {/* Modal de confirmação de exclusão de pagamento */}
      {showDeletePagamentoModal && pagamentoToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 border border-slate-700">
            <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Excluir pagamento?
            </h2>

            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Valor</p>
                  <p className="font-semibold text-white">{formatarMoeda(pagamentoToDelete.valor)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="font-semibold text-white">
                    {new Date(pagamentoToDelete.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              {pagamentoToDelete.formaPagamento && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Forma de Pagamento</p>
                  <p className="font-semibold text-white">{pagamentoToDelete.formaPagamento}</p>
                </div>
              )}
            </div>

            <p className="text-gray-400 text-center mb-6">
              Esta ação é permanente e não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCloseDeletePagamentoModal}
                className="flex-1 px-4 py-3 border border-slate-600 rounded-xl font-medium text-gray-300 hover:bg-slate-800/50 transition-all"
                disabled={excluindoPagamento !== null}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeletePagamento}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={excluindoPagamento !== null}
              >
                {excluindoPagamento ? (
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
