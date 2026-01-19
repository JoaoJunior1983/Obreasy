"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText, Calendar, Hammer, Users, FileBarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Obra, type Profissional } from "@/lib/storage"

type TipoRelatorio = "geral" | "periodo" | "material" | "mao_obra_total" | "mao_obra_profissional"

export default function EscolhaRelatorioPage() {
  const router = useRouter()
  const params = useParams()
  const obraId = params.id as string

  const [obra, setObra] = useState<Obra | null>(null)
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estado do formulário
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("geral")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [profissionalId, setProfissionalId] = useState("")

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    // Carregar obra
    const todasObras = JSON.parse(localStorage.getItem("obras") || "[]") as Obra[]
    const obraEncontrada = todasObras.find(o => o.id === obraId)
    
    if (!obraEncontrada) {
      router.push("/obras")
      return
    }

    setObra(obraEncontrada)

    // Carregar profissionais
    const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]") as Profissional[]
    const profissionaisObra = todosProfissionais.filter(p => p.obraId === obraId)
    setProfissionais(profissionaisObra)

    setLoading(false)
  }, [obraId, router])

  const handleVoltar = () => {
    router.push(`/dashboard/obra`)
  }

  const handleGerarRelatorio = () => {
    if (!obra) return

    // Validações
    if (tipoRelatorio === "periodo" && (!dataInicio || !dataFim)) {
      alert("Por favor, preencha as datas de início e fim para o relatório por período.")
      return
    }

    if (tipoRelatorio === "mao_obra_profissional" && !profissionalId) {
      alert("Por favor, selecione um profissional.")
      return
    }

    // Construir query params
    const params = new URLSearchParams({
      tipo: tipoRelatorio,
      ...(tipoRelatorio === "periodo" && { dataInicio, dataFim }),
      ...(tipoRelatorio === "mao_obra_profissional" && { profissionalId })
    })

    // Navegar para preview
    router.push(`/dashboard/obras/${obraId}/relatorio/preview?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!obra) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleVoltar}
            className="mb-4 hover:bg-blue-50 text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Gerar Relatório
              </h1>
              <p className="text-sm text-gray-500">
                {obra.nome}
              </p>
            </div>
          </div>
        </div>

        {/* Card de seleção */}
        <Card className="p-6 sm:p-8 bg-white shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Escolha o tipo de relatório
          </h2>

          <div className="space-y-4">
            {/* Relatório Geral */}
            <div
              onClick={() => setTipoRelatorio("geral")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoRelatorio === "geral"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tipoRelatorio === "geral" ? "bg-blue-600" : "bg-gray-200"
                }`}>
                  <FileBarChart className={`w-5 h-5 ${
                    tipoRelatorio === "geral" ? "text-white" : "text-gray-600"
                  }`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Relatório Geral da Obra</p>
                  <p className="text-sm text-gray-500">
                    Visão completa com todas as informações financeiras e de progresso
                  </p>
                </div>
              </div>
            </div>

            {/* Relatório por Período */}
            <div
              onClick={() => setTipoRelatorio("periodo")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoRelatorio === "periodo"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tipoRelatorio === "periodo" ? "bg-blue-600" : "bg-gray-200"
                }`}>
                  <Calendar className={`w-5 h-5 ${
                    tipoRelatorio === "periodo" ? "text-white" : "text-gray-600"
                  }`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Relatório por Período</p>
                  <p className="text-sm text-gray-500">
                    Despesas e movimentações em um intervalo de datas específico
                  </p>
                </div>
              </div>

              {tipoRelatorio === "periodo" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pl-13">
                  <div>
                    <Label htmlFor="dataInicio" className="text-sm font-medium text-gray-700 mb-1">
                      Data Inicial
                    </Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataFim" className="text-sm font-medium text-gray-700 mb-1">
                      Data Final
                    </Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Apenas Material/Outros */}
            <div
              onClick={() => setTipoRelatorio("material")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoRelatorio === "material"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tipoRelatorio === "material" ? "bg-blue-600" : "bg-gray-200"
                }`}>
                  <Hammer className={`w-5 h-5 ${
                    tipoRelatorio === "material" ? "text-white" : "text-gray-600"
                  }`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Apenas Material / Outros</p>
                  <p className="text-sm text-gray-500">
                    Relatório focado em despesas de materiais e outros custos
                  </p>
                </div>
              </div>
            </div>

            {/* Mão de Obra Total */}
            <div
              onClick={() => setTipoRelatorio("mao_obra_total")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoRelatorio === "mao_obra_total"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tipoRelatorio === "mao_obra_total" ? "bg-blue-600" : "bg-gray-200"
                }`}>
                  <Users className={`w-5 h-5 ${
                    tipoRelatorio === "mao_obra_total" ? "text-white" : "text-gray-600"
                  }`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Mão de Obra (Total)</p>
                  <p className="text-sm text-gray-500">
                    Visão consolidada de todos os custos com mão de obra
                  </p>
                </div>
              </div>
            </div>

            {/* Mão de Obra por Profissional */}
            <div
              onClick={() => setTipoRelatorio("mao_obra_profissional")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoRelatorio === "mao_obra_profissional"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tipoRelatorio === "mao_obra_profissional" ? "bg-blue-600" : "bg-gray-200"
                }`}>
                  <Users className={`w-5 h-5 ${
                    tipoRelatorio === "mao_obra_profissional" ? "text-white" : "text-gray-600"
                  }`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Mão de Obra por Profissional</p>
                  <p className="text-sm text-gray-500">
                    Detalhamento de custos de um profissional específico
                  </p>
                </div>
              </div>

              {tipoRelatorio === "mao_obra_profissional" && (
                <div className="mt-4 pl-13">
                  <Label htmlFor="profissional" className="text-sm font-medium text-gray-700 mb-1">
                    Selecione o Profissional
                  </Label>
                  <Select value={profissionalId} onValueChange={setProfissionalId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Escolha um profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {profissionais.length > 0 ? (
                        profissionais.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.nome} - {prof.funcao}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Nenhum profissional cadastrado
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Botão de ação */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleGerarRelatorio}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg text-lg py-6"
            >
              <FileText className="w-5 h-5 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
