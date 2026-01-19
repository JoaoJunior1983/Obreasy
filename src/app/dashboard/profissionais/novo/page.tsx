"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X, User, Briefcase, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { toast } from "sonner"

const FUNCOES = [
  "Pedreiro",
  "Eletricista",
  "Encanador",
  "Azulejista",
  "Pintor",
  "Gesseiro",
  "Marceneiro",
  "Engenheiro",
  "Arquiteto",
  "Outros"
]

export default function NovoProfissionalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [obraId, setObraId] = useState("")
  
  const [formData, setFormData] = useState({
    nome: "",
    funcao: "",
    telefone: "",
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
    } else {
      router.push("/dashboard/criar-obra")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.nome || !formData.funcao) {
        alert("Por favor, preencha o nome e a função do profissional")
        setLoading(false)
        return
      }

      const profissional = {
        id: Date.now().toString(),
        obraId: obraId,
        nome: formData.nome,
        funcao: formData.funcao,
        telefone: formData.telefone || undefined,
        observacoes: formData.observacoes || undefined,
        pagamentos: [],
        extras: []
      }

      const profissionaisExistentes = JSON.parse(localStorage.getItem("profissionais") || "[]")
      profissionaisExistentes.push(profissional)
      localStorage.setItem("profissionais", JSON.stringify(profissionaisExistentes))

      toast.success("Profissional cadastrado com sucesso!")

      setTimeout(() => {
        router.push(`/dashboard/profissionais/${profissional.id}`)
      }, 800)

    } catch (error) {
      console.error("Erro ao salvar profissional:", error)
      alert("Erro ao salvar profissional. Tente novamente.")
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
            onClick={() => router.push("/dashboard/profissionais")}
            className="mb-6 hover:bg-slate-800/50 text-gray-300 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Profissionais
          </Button>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Novo Profissional
            </h1>
            <p className="text-base text-gray-400">
              Cadastre um novo profissional da obra
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <Card className="p-8 bg-slate-800/50 border border-slate-700/30 shadow-lg rounded-2xl space-y-8">
            {/* Nome */}
            <div className="space-y-3">
              <Label htmlFor="nome" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Nome do Profissional *
              </Label>
              <Input
                id="nome"
                placeholder="Ex: João Silva"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Função */}
            <div className="space-y-3">
              <Label htmlFor="funcao" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                Função *
              </Label>
              <Select
                value={formData.funcao}
                onValueChange={(value) => setFormData({ ...formData, funcao: value })}
                required
              >
                <SelectTrigger className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {FUNCOES.map((funcao) => (
                    <SelectItem key={funcao} value={funcao}>
                      {funcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Telefone / WhatsApp */}
            <div className="space-y-3">
              <Label htmlFor="telefone" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                Telefone / WhatsApp (opcional)
              </Label>
              <Input
                id="telefone"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Observações */}
            <div className="space-y-3">
              <Label htmlFor="observacoes" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Observações (opcional)
              </Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais sobre o profissional..."
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
                onClick={() => router.push("/dashboard/profissionais")}
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
                {loading ? "Salvando..." : "Salvar profissional"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
