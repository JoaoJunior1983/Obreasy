"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { type Obra, type Despesa, type Profissional } from "@/lib/storage"

type TipoRelatorio = "geral" | "periodo" | "material" | "mao_obra_total" | "mao_obra_profissional"

function ImprimirRelatorioContent() {
  const searchParams = useSearchParams()
  const obraId = searchParams.get("obraId") || ""
  const tipo = (searchParams.get("tipo") || "geral") as TipoRelatorio
  const dataInicio = searchParams.get("dataInicio") || ""
  const dataFim = searchParams.get("dataFim") || ""
  const profissionalId = searchParams.get("profissionalId") || ""

  const [obra, setObra] = useState<Obra | null>(null)
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [printTriggered, setPrintTriggered] = useState(false)

  useEffect(() => {
    console.log("[DEBUG] Iniciando carregamento do relatório para impressão")
    console.log("[DEBUG] Parâmetros:", { obraId, tipo, dataInicio, dataFim, profissionalId })

    if (!obraId) {
      console.error("[DEBUG] obraId não fornecido - print not triggered")
      return
    }

    try {
      const todasObras = JSON.parse(localStorage.getItem("obras") || "[]") as Obra[]
      const obraEncontrada = todasObras.find(o => o.id === obraId)
      
      if (!obraEncontrada) {
        console.error("[DEBUG] Obra não encontrada - print not triggered")
        return
      }

      console.log("[DEBUG] Obra carregada:", obraEncontrada.nome)
      setObra(obraEncontrada)

      const todasDespesas = JSON.parse(localStorage.getItem("despesas") || "[]") as Despesa[]
      const despesasObra = todasDespesas.filter(d => d.obraId === obraId)
      console.log("[DEBUG] Despesas carregadas:", despesasObra.length)
      setDespesas(despesasObra)

      const todosProfissionais = JSON.parse(localStorage.getItem("profissionais") || "[]") as Profissional[]
      const profissionaisObra = todosProfissionais.filter(p => p.obraId === obraId)
      console.log("[DEBUG] Profissionais carregados:", profissionaisObra.length)
      setProfissionais(profissionaisObra)

      setLoading(false)
    } catch (error) {
      console.error("[DEBUG] Erro ao carregar dados:", error)
      console.error("[DEBUG] print not triggered - erro no carregamento")
    }
  }, [obraId, tipo, dataInicio, dataFim, profissionalId])

  useEffect(() => {
    if (!loading && obra && !printTriggered) {
      console.log("[DEBUG] Relatório renderizado, aguardando 500ms para chamar window.print()")
      
      const timer = setTimeout(() => {
        console.log("[DEBUG] Chamando window.print()")
        setPrintTriggered(true)
        window.print()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [loading, obra, printTriggered])

  const formatarMoeda = (valor: number): string => {
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

  const filtrarDespesasPorPeriodo = (despesas: Despesa[]): Despesa[] => {
    if (tipo !== "periodo" || !dataInicio || !dataFim) return despesas

    return despesas.filter(d => {
      if (!d.data) return false
      const dataDespesa = new Date(d.data)
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)
      return dataDespesa >= inicio && dataDespesa <= fim
    })
  }

  const filtrarDespesasPorTipo = (despesas: Despesa[]): Despesa[] => {
    if (tipo === "material") {
      return despesas.filter(d => {
        const category = String(d.category ?? d.categoria ?? d.tipo ?? "").toLowerCase()
        const isMaoObra = category === "mao_obra" || category === "mão de obra"
        const temProfissional = !!d.profissionalId
        return !isMaoObra && !temProfissional
      })
    }

    if (tipo === "mao_obra_total" || tipo === "mao_obra_profissional") {
      let despesasMaoObra = despesas.filter(d => {
        const category = String(d.category ?? d.categoria ?? d.tipo ?? "").toLowerCase()
        const isMaoObra = category === "mao_obra" || category === "mão de obra"
        const temProfissional = !!d.profissionalId
        return isMaoObra || temProfissional
      })

      if (tipo === "mao_obra_profissional" && profissionalId) {
        despesasMaoObra = despesasMaoObra.filter(d => d.profissionalId === profissionalId)
      }

      return despesasMaoObra
    }

    return despesas
  }

  const calcularTotalGasto = (): number => {
    const despesasFiltradas = filtrarDespesasPorTipo(filtrarDespesasPorPeriodo(despesas))
    return despesasFiltradas.reduce((acc, d) => acc + (d.valor ?? 0), 0)
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
    return formatarMoeda(custo)
  }

  const calcularDistribuicao = () => {
    const despesasFiltradas = filtrarDespesasPorPeriodo(despesas)
    const totalGasto = despesasFiltradas.reduce((acc, d) => acc + (d.valor ?? 0), 0)
    
    const maoObra = despesasFiltradas
      .filter(d => {
        const category = String(d.category ?? d.categoria ?? d.tipo ?? "").toLowerCase()
        const isMaoObra = category === "mao_obra" || category === "mão de obra"
        const temProfissional = !!d.profissionalId
        return isMaoObra || temProfissional
      })
      .reduce((acc, d) => acc + (d.valor ?? 0), 0)

    const materialOutros = totalGasto - maoObra

    const orcamentoTotal = obra?.orcamento || 0
    const baseCalculo = orcamentoTotal > 0 ? orcamentoTotal : totalGasto
    
    const percMaterialOutros = baseCalculo > 0 ? (materialOutros / baseCalculo) * 100 : 0
    const percMaoObra = baseCalculo > 0 ? (maoObra / baseCalculo) * 100 : 0

    return {
      materialOutros,
      maoObra,
      percMaterialOutros,
      percMaoObra
    }
  }

  const getProfissionalNome = (id: string): string => {
    const prof = profissionais.find(p => p.id === id)
    return prof ? `${prof.nome} - ${prof.funcao}` : "Profissional não encontrado"
  }

  const getTituloRelatorio = (): string => {
    switch (tipo) {
      case "geral":
        return "Relatório Geral da Obra"
      case "periodo":
        return `Relatório por Período (${formatarData(dataInicio)} a ${formatarData(dataFim)})`
      case "material":
        return "Relatório de Material / Outros"
      case "mao_obra_total":
        return "Relatório de Mão de Obra (Total)"
      case "mao_obra_profissional":
        return `Relatório de Mão de Obra - ${getProfissionalNome(profissionalId)}`
      default:
        return "Relatório"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando relatório para impressão...</p>
        </div>
      </div>
    )
  }

  if (!obra) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 font-bold">Erro: Obra não encontrada</p>
          <p className="text-gray-600 text-sm mt-2">Verifique o console para mais detalhes</p>
        </div>
      </div>
    )
  }

  const totalGasto = calcularTotalGasto()
  const saldoDisponivel = calcularSaldoDisponivel()
  const distribuicao = calcularDistribuicao()
  const despesasFiltradas = filtrarDespesasPorTipo(filtrarDespesasPorPeriodo(despesas))

  return (
    <>
      <div className="max-w-5xl mx-auto p-8 bg-white">
        {/* Cabeçalho do relatório */}
        <div className="mb-8 pb-6 border-b-2 border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTituloRelatorio()}
          </h1>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Obra:</strong> {obra.nome}</p>
            <p><strong>Localização:</strong> {obra.localizacao.cidade}/{obra.localizacao.estado}</p>
            <p><strong>Tipo:</strong> {obra.tipo === "construcao" ? "Construção" : "Reforma"}</p>
            <p><strong>Área:</strong> {obra.area} m²</p>
            <p><strong>Data do relatório:</strong> {formatarData(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Resumo financeiro - apenas para relatórios gerais e por período */}
        {(tipo === "geral" || tipo === "periodo") && (
          <div className="mb-8 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo Financeiro</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Orçamento Estimado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {obra.orcamento ? formatarMoeda(obra.orcamento) : "Não definido"}
                </p>
              </div>
              <div className="border-2 border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Total Gasto</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(totalGasto)}</p>
              </div>
              <div className="border-2 border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Saldo Disponível</p>
                <p className="text-2xl font-bold text-gray-900">
                  {obra.orcamento ? formatarMoeda(saldoDisponivel) : "R$ 0,00"}
                </p>
              </div>
              <div className="border-2 border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Custo por m²</p>
                <p className="text-2xl font-bold text-gray-900">{calcularCustoPorM2()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Distribuição de gastos - apenas para relatórios gerais e por período */}
        {(tipo === "geral" || tipo === "periodo") && totalGasto > 0 && (
          <div className="mb-8 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Distribuição de Gastos</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">Material / Outros</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatarMoeda(distribuicao.materialOutros)}
                </p>
                <p className="text-sm text-gray-600">
                  {distribuicao.percMaterialOutros.toFixed(1)}% do orçamento
                </p>
              </div>
              <div className="border-2 border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">Mão de Obra</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatarMoeda(distribuicao.maoObra)}
                </p>
                <p className="text-sm text-gray-600">
                  {distribuicao.percMaoObra.toFixed(1)}% do orçamento
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de despesas */}
        {despesasFiltradas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Despesas Detalhadas ({despesasFiltradas.length})
            </h2>
            <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-800">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-800">Descrição</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-800">Categoria</th>
                    {(tipo === "mao_obra_total" || tipo === "geral") && (
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-800">Profissional</th>
                    )}
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-900 border-b-2 border-gray-800">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {despesasFiltradas.map((despesa, index) => (
                    <tr key={despesa.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-300">
                        {despesa.data ? formatarData(despesa.data) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-300">
                        {despesa.descricao || "Sem descrição"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-300">
                        {despesa.category || despesa.categoria || despesa.tipo || "-"}
                      </td>
                      {(tipo === "mao_obra_total" || tipo === "geral") && (
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-300">
                          {despesa.profissionalId ? getProfissionalNome(despesa.profissionalId) : "-"}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold border-b border-gray-300">
                        {formatarMoeda(despesa.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-200">
                  <tr>
                    <td colSpan={(tipo === "mao_obra_total" || tipo === "geral") ? 4 : 3} className="px-4 py-3 text-sm font-bold text-gray-900 text-right border-t-2 border-gray-800">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right border-t-2 border-gray-800">
                      {formatarMoeda(totalGasto)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Profissionais - apenas para relatório geral */}
        {tipo === "geral" && profissionais.length > 0 && (
          <div className="mb-8 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Profissionais Cadastrados ({profissionais.length})
            </h2>
            <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-800">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-800">Função</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-900 border-b-2 border-gray-800">Valor Previsto</th>
                  </tr>
                </thead>
                <tbody>
                  {profissionais.map((prof, index) => {
                    const valorPrevisto = prof.valorPrevisto || prof.contrato?.valorPrevisto || prof.contrato?.valorTotalPrevisto || 0
                    return (
                      <tr key={prof.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-300">{prof.nome}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-300">{prof.funcao}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold border-b border-gray-300">
                          {formatarMoeda(valorPrevisto)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-12 pt-6 border-t-2 border-gray-800 text-center text-sm text-gray-600">
          <p className="font-bold">Relatório gerado pelo sistema OBREASY</p>
          <p>{formatarData(new Date().toISOString())} às {new Date().toLocaleTimeString("pt-BR")}</p>
        </div>
      </div>

      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          @page {
            margin: 1.5cm;
            size: A4;
          }
          
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
        }
        
        @media screen {
          body {
            background: #f3f4f6;
          }
        }
      `}</style>
    </>
  )
}

export default function ImprimirRelatorioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    }>
      <ImprimirRelatorioContent />
    </Suspense>
  )
}
