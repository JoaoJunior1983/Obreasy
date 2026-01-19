"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X, Calendar, DollarSign, FileText, CreditCard, User, MessageSquare, Plus, CheckCircle2, Home } from "lucide-react"
import { goToObraDashboard } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/custom/FileUpload"
import Image from "next/image"
import { toast } from "sonner"

const CATEGORIAS = ["material", "mao_obra", "outros"]

const FORMAS_PAGAMENTO = [
  "Pix",
  "Dinheiro",
  "Cartão",
  "Boleto",
  "Transferência"
]

interface Profissional {
  id: string
  obraId: string
  nome: string
  funcao: string
}

// Função para formatar valor monetário brasileiro
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

export default function NovaDespesaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [obraId, setObraId] = useState("")
  const [valorFormatado, setValorFormatado] = useState("")
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [comprovanteAnexo, setComprovanteAnexo] = useState<string | null>(null)
  const primeiroInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    category: "",
    descricao: "",
    valor: "",
    formaPagamento: "",
    fornecedor: "",
    professionalId: "",
    observacoes: ""
  })

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

    const user = JSON.parse(userData)
    const obrasExistentes = JSON.parse(localStorage.getItem("obras") || "[]")
    const obrasDoUsuario = obrasExistentes.filter((o: any) => o.userId === user.email)
    
    if (obrasDoUsuario.length > 0) {
      const obraMaisRecente = obrasDoUsuario[obrasDoUsuario.length - 1]
      setObraId(obraMaisRecente.id)

      const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]")
      const profissionaisObra = todosProfissionais.filter((p: Profissional) => p.obraId === obraMaisRecente.id)
      setProfissionais(profissionaisObra)
    } else {
      router.push("/dashboard/criar-obra")
    }
  }, [router])

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value
    const valorFormatado = formatarMoeda(valorDigitado)
    setValorFormatado(valorFormatado)
    
    const valorNumerico = removerFormatacao(valorFormatado)
    setFormData({ ...formData, valor: valorNumerico > 0 ? valorNumerico.toString() : "" })
  }

  const handleProfissionalChange = (value: string) => {
    if (value === "__new__") {
      router.push("/dashboard/profissionais/novo")
    } else if (value === "__none__") {
      setFormData({ ...formData, professionalId: "", fornecedor: "" })
    } else {
      setFormData({ ...formData, professionalId: value, category: "mao_obra" })
      
      const profissional = profissionais.find(p => p.id === value)
      if (profissional) {
        setFormData(prev => ({ ...prev, professionalId: value, category: "mao_obra", fornecedor: profissional.nome }))
      }
    }
  }

  const limparFormulario = () => {
    setFormData({
      data: new Date().toISOString().split("T")[0],
      category: "",
      descricao: "",
      valor: "",
      formaPagamento: "",
      fornecedor: "",
      professionalId: "",
      observacoes: ""
    })
    setValorFormatado("")
    setSuccess(false)
    setLoading(false)
    
    setTimeout(() => {
      primeiroInputRef.current?.focus()
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.data || !formData.category || !formData.valor || parseFloat(formData.valor) <= 0) {
        alert("Por favor, preencha todos os campos obrigatórios (Data, Categoria e Valor)")
        setLoading(false)
        return
      }

      const categoryFinal = formData.professionalId ? "mao_obra" : formData.category

      let descricaoFinal = formData.descricao
      if (formData.professionalId && !descricaoFinal) {
        const profissional = profissionais.find(p => p.id === formData.professionalId)
        if (profissional) {
          descricaoFinal = `Pagamento - ${profissional.nome}`
        }
      }

      const despesa = {
        id: Date.now().toString(),
        obraId: obraId,
        data: formData.data,
        category: categoryFinal,
        categoria: categoryFinal,
        descricao: descricaoFinal,
        valor: parseFloat(formData.valor),
        formaPagamento: formData.formaPagamento,
        fornecedor: formData.fornecedor || undefined,
        professionalId: formData.professionalId || undefined,
        profissionalId: formData.professionalId || undefined,
        observacoes: formData.observacoes || undefined,
        observacao: formData.observacoes || undefined,
        comprovanteAnexo: comprovanteAnexo || undefined
      }

      const despesasExistentes = JSON.parse(localStorage.getItem("despesas") || "[]")
      despesasExistentes.push(despesa)
      localStorage.setItem("despesas", JSON.stringify(despesasExistentes))

      if (formData.professionalId) {
        window.dispatchEvent(new CustomEvent("pagamentoSalvo", { 
          detail: { profissionalId: formData.professionalId } 
        }))
      }

      toast.success("Despesa salva com sucesso!")
      setSuccess(true)
      setLoading(false)

    } catch (error) {
      console.error("Erro ao salvar despesa:", error)
      toast.error("Erro ao salvar despesa. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Logo OBREASY */}
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

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/despesas")}
            className="mb-6 hover:bg-slate-800/50 text-gray-300 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Despesas
          </Button>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Nova Despesa
            </h1>
            <p className="text-base text-gray-400">
              Registre uma nova despesa da obra
            </p>
          </div>
        </div>

        {/* Mensagem de Sucesso */}
        {success && (
          <Card className="p-8 mb-8 bg-slate-800/50 border border-slate-700/30 shadow-lg rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Despesa salva com sucesso!
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  A despesa foi registrada e já está disponível na listagem.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={limparFormulario}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium h-12 rounded-xl shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Lançar nova despesa
                  </Button>
                  <Button
                    onClick={() => goToObraDashboard(router, obraId)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 border-2 border-slate-600 h-12 rounded-xl shadow-md"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Voltar ao dashboard
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Formulário */}
        {!success && (
          <form onSubmit={handleSubmit}>
            <Card className="p-8 bg-slate-800/50 border border-slate-700/30 shadow-lg rounded-2xl space-y-8">
              {/* Data e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="data" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Data *
                  </Label>
                  <Input
                    ref={primeiroInputRef}
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                    className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="categoria" className="text-sm text-gray-300 font-medium">
                    Categoria *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                    disabled={!!formData.professionalId}
                  >
                    <SelectTrigger className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="mao_obra">Mão de obra</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.professionalId && (
                    <p className="text-xs text-blue-400">
                      Categoria definida automaticamente como "Mão de obra" ao vincular profissional
                    </p>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-3">
                <Label htmlFor="descricao" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Descrição
                </Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Compra de cimento para fundação"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Valor e Forma de Pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="valor" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    Valor *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      R$
                    </span>
                    <Input
                      id="valor"
                      type="text"
                      placeholder="0,00"
                      value={valorFormatado}
                      onChange={handleValorChange}
                      required
                      className="h-12 pl-14 bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="formaPagamento" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    Forma de Pagamento
                  </Label>
                  <Select
                    value={formData.formaPagamento}
                    onValueChange={(value) => setFormData({ ...formData, formaPagamento: value })}
                  >
                    <SelectTrigger className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {FORMAS_PAGAMENTO.map((forma) => (
                        <SelectItem key={forma} value={forma}>
                          {forma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Profissional */}
              {formData.category === "mao_obra" && (
                <div className="space-y-3">
                  <Label htmlFor="profissional" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    Profissional (opcional)
                  </Label>
                  {profissionais.length === 0 ? (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <p className="text-sm text-yellow-400">
                        Nenhum profissional cadastrado ainda. 
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard/profissionais/novo")}
                          className="ml-1 text-blue-400 hover:underline font-semibold"
                        >
                          Cadastrar agora
                        </button>
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={formData.professionalId}
                      onValueChange={handleProfissionalChange}
                    >
                      <SelectTrigger className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Selecione um profissional (opcional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="__none__">Sem profissional</SelectItem>
                        {profissionais
                          .filter(p => p?.id && String(p.id).trim().length > 0)
                          .map((profissional) => (
                            <SelectItem key={profissional.id} value={String(profissional.id)}>
                              {profissional.nome} - {profissional.funcao}
                            </SelectItem>
                          ))}
                        <SelectItem value="__new__" className="text-blue-400 font-semibold border-t border-slate-700 mt-2 pt-2">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            + Cadastrar novo profissional
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Fornecedor */}
              {(formData.category !== "mao_obra" || !formData.professionalId) && (
                <div className="space-y-3">
                  <Label htmlFor="fornecedor" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    Nome do Fornecedor (opcional)
                  </Label>
                  <Input
                    id="fornecedor"
                    placeholder="Ex: Loja de Materiais XYZ"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                    className="h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Anexar Comprovante */}
              <FileUpload
                label="Anexar comprovante de pagamento"
                accept="image/jpeg,image/png,application/pdf"
                maxSize={10}
                value={comprovanteAnexo}
                onChange={(file, preview) => setComprovanteAnexo(preview)}
              />

              {/* Observações */}
              <div className="space-y-3">
                <Label htmlFor="observacoes" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Observações (opcional)
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais sobre esta despesa..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={4}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700/50">
                <Button
                  type="button"
                  onClick={() => router.push("/dashboard/despesas")}
                  className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 text-gray-300 border-2 border-slate-600 rounded-xl shadow-md"
                  disabled={loading}
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg"
                  disabled={loading}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {loading ? "Salvando..." : "Salvar despesa"}
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}
