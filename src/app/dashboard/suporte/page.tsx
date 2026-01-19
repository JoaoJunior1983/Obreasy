"use client"

import { useState } from "react"
import { Search, ChevronDown, ChevronUp, Send, HelpCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface FAQ {
  id: number
  pergunta: string
  resposta: string
}

const faqs: FAQ[] = [
  {
    id: 1,
    pergunta: "Como cadastrar uma nova obra?",
    resposta: "Para cadastrar uma nova obra, vá até a página 'Minhas Obras' e clique no botão 'Nova Obra'. Preencha os dados solicitados como nome da obra, localização, orçamento estimado e área em m². Após preencher, clique em 'Salvar' e sua obra estará criada."
  },
  {
    id: 2,
    pergunta: "Como lançar gastos de material?",
    resposta: "No dashboard da obra, clique em 'Adicionar Despesa'. Selecione o tipo 'Material' ou 'Outros', preencha a descrição do item, o valor gasto e a data. Você também pode adicionar observações se necessário. Clique em 'Salvar' para registrar o gasto."
  },
  {
    id: 3,
    pergunta: "Como lançar mão de obra?",
    resposta: "Acesse o dashboard da obra e vá até a seção 'Mão de Obra'. Clique em 'Adicionar Profissional', preencha o nome do profissional, função, valor previsto e outras informações relevantes. Você pode registrar pagamentos parciais conforme for efetuando os pagamentos."
  },
  {
    id: 4,
    pergunta: "Como gerar relatório em PDF?",
    resposta: "No dashboard da obra, clique no botão 'Gerar Relatório (PDF)' localizado no topo da página. Você será direcionado para uma tela onde poderá escolher o tipo de relatório desejado (geral, por período, apenas material, apenas mão de obra, etc.). Após selecionar, clique em 'Gerar Relatório' e depois em 'Imprimir / Salvar PDF'."
  },
  {
    id: 5,
    pergunta: "Como editar ou excluir lançamentos?",
    resposta: "Para editar um lançamento, localize-o na lista de despesas ou mão de obra e clique no ícone de edição (lápis). Faça as alterações necessárias e salve. Para excluir, clique no ícone de lixeira e confirme a exclusão. Atenção: a exclusão é permanente e não pode ser desfeita."
  },
  {
    id: 6,
    pergunta: "Como acompanhar o saldo da obra?",
    resposta: "O saldo da obra é calculado automaticamente e exibido no dashboard principal. Ele considera o orçamento estimado menos o total de gastos (material + mão de obra). Você pode visualizar também o percentual gasto e o custo por m²."
  },
  {
    id: 7,
    pergunta: "Posso ter múltiplas obras cadastradas?",
    resposta: "Sim! Você pode cadastrar quantas obras desejar. Para alternar entre elas, vá até 'Minhas Obras' e clique na obra que deseja visualizar. A obra ativa será exibida no topo do header."
  },
  {
    id: 8,
    pergunta: "Como funciona o sistema de alertas?",
    resposta: "O sistema de alertas notifica você sobre eventos importantes, como quando o orçamento está próximo do limite, pagamentos pendentes ou outras informações relevantes da obra. Você pode acessar todos os alertas clicando no ícone de sino no menu do usuário."
  }
]

export default function SuportePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [mensagem, setMensagem] = useState("")
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)

  const filteredFaqs = faqs.filter(faq =>
    faq.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.resposta.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simular envio (em produção, aqui seria uma chamada à API)
    setEnviado(true)
    
    // Resetar formulário após 3 segundos
    setTimeout(() => {
      setMensagem("")
      setEmail("")
      setEnviado(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Voltar</span>
        </button>

        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Suporte</h1>
          <p className="text-gray-600">Como podemos ajudar você hoje?</p>
        </div>

        {/* Campo de busca */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Busque sua dúvida aqui..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Perguntas Frequentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-12">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Perguntas Frequentes</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="px-6 py-4">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {faq.pergunta}
                    </span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                    )}
                  </button>
                  
                  {expandedFaq === faq.id && (
                    <div className="mt-3 text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                      {faq.resposta}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhuma pergunta encontrada para "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        {/* Fale Conosco */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Fale Conosco</h2>
            <p className="text-sm text-gray-600 mt-1">
              Não encontrou o que procurava? Envie sua dúvida ou problema e entraremos em contato.
            </p>
          </div>
          
          <form onSubmit={handleEnviar} className="px-6 py-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Seu e-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                Descreva seu problema ou dúvida
              </label>
              <textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                required
                rows={5}
                placeholder="Descreva detalhadamente sua dúvida ou problema..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {enviado && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800 animate-in fade-in slide-in-from-top-2 duration-200">
                ✓ Mensagem enviada com sucesso! Entraremos em contato em breve.
              </div>
            )}

            <button
              type="submit"
              disabled={enviado}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Enviar Mensagem
            </button>
          </form>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Horário de atendimento: Segunda a Sexta, das 9h às 18h</p>
          <p className="mt-1">Tempo médio de resposta: 24 horas úteis</p>
        </div>
      </div>
    </div>
  )
}
