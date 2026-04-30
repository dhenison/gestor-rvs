"use client"

import { useState } from "react"
import {
  MessageCircle,
  Send,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings,
  Zap,
  Calendar,
  UserX,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data - Alunos com frequência baixa
const alunosFrequenciaBaixa = [
  {
    id: 1,
    nome: "João Pedro Silva",
    turma: "1º Ano A",
    frequencia: 68,
    faltasConsecutivas: 5,
    responsavel: "Maria Silva",
    telefone: "(91) 98765-4321",
    ultimaMensagem: "2026-04-25",
    status: "pendente",
  },
  {
    id: 2,
    nome: "Ana Carolina Santos",
    turma: "2º Ano B",
    frequencia: 72,
    faltasConsecutivas: 3,
    responsavel: "José Santos",
    telefone: "(91) 99876-5432",
    ultimaMensagem: "2026-04-27",
    status: "enviado",
  },
  {
    id: 3,
    nome: "Lucas Oliveira",
    turma: "1º Ano B",
    frequencia: 65,
    faltasConsecutivas: 7,
    responsavel: "Carla Oliveira",
    telefone: "(91) 98123-4567",
    ultimaMensagem: null,
    status: "critico",
  },
  {
    id: 4,
    nome: "Mariana Costa",
    turma: "3º Ano A",
    frequencia: 75,
    faltasConsecutivas: 2,
    responsavel: "Paulo Costa",
    telefone: "(91) 97654-3210",
    ultimaMensagem: "2026-04-28",
    status: "enviado",
  },
  {
    id: 5,
    nome: "Gabriel Ferreira",
    turma: "2º Ano A",
    frequencia: 58,
    faltasConsecutivas: 10,
    responsavel: "Sandra Ferreira",
    telefone: "(91) 98234-5678",
    ultimaMensagem: "2026-04-20",
    status: "critico",
  },
]

const templatesMessages = [
  {
    id: 1,
    nome: "Alerta de Frequência",
    mensagem:
      "Prezado(a) responsável, informamos que o(a) aluno(a) {NOME_ALUNO} está com frequência de {FREQUENCIA}%. Solicitamos atenção para regularização das presenças.",
    tipo: "frequencia",
  },
  {
    id: 2,
    nome: "Faltas Consecutivas",
    mensagem:
      "Prezado(a) {NOME_RESPONSAVEL}, o(a) aluno(a) {NOME_ALUNO} possui {FALTAS} faltas consecutivas. Entre em contato com a escola para esclarecimentos.",
    tipo: "faltas",
  },
  {
    id: 3,
    nome: "Risco de Infrequência",
    mensagem:
      "URGENTE: {NOME_ALUNO} está em situação crítica de infrequência ({FREQUENCIA}%). Compareça à escola para reunião com a coordenação.",
    tipo: "critico",
  },
]

const configRules = [
  {
    id: 1,
    nome: "Alerta Inicial",
    condicao: "Frequência < 80%",
    acao: "Enviar mensagem de alerta",
    ativo: true,
  },
  {
    id: 2,
    nome: "Alerta Médio",
    condicao: "3+ Faltas consecutivas",
    acao: "Notificar responsável",
    ativo: true,
  },
  {
    id: 3,
    nome: "Alerta Crítico",
    condicao: "Frequência < 70%",
    acao: "Mensagem urgente + Agendar reunião",
    ativo: true,
  },
  {
    id: 4,
    nome: "Pré-Evasão",
    condicao: "7+ Faltas consecutivas",
    acao: "Acionar Conselho Tutelar",
    ativo: false,
  },
]

export function MensagensContent() {
  const [activeTab, setActiveTab] = useState<"enviar" | "historico" | "config">(
    "enviar"
  )
  const [selectedAlunos, setSelectedAlunos] = useState<number[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [expandedConfig, setExpandedConfig] = useState(false)

  const filteredAlunos = alunosFrequenciaBaixa.filter((aluno) => {
    const matchesSearch =
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.turma.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === "todos" || aluno.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const toggleSelectAluno = (id: number) => {
    setSelectedAlunos((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const selectAllAlunos = () => {
    if (selectedAlunos.length === filteredAlunos.length) {
      setSelectedAlunos([])
    } else {
      setSelectedAlunos(filteredAlunos.map((a) => a.id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critico":
        return "bg-destructive/10 text-destructive border-destructive/30"
      case "enviado":
        return "bg-success/10 text-success border-success/30"
      case "pendente":
        return "bg-warning/10 text-warning border-warning/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "critico":
        return "Crítico"
      case "enviado":
        return "Enviado"
      case "pendente":
        return "Pendente"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 lg:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">
                Central de Mensagens
              </h1>
              <p className="text-sm text-primary-foreground/70">
                Disparo automático de WhatsApp para responsáveis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
              <Zap className="w-4 h-4" />
              Integração WhatsApp
            </span>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <UserX className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">12</p>
              <p className="text-xs text-muted-foreground">Alunos em Risco</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">8</p>
              <p className="text-xs text-muted-foreground">Msgs Pendentes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">47</p>
              <p className="text-xs text-muted-foreground">Enviadas Hoje</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">89%</p>
              <p className="text-xs text-muted-foreground">Taxa de Leitura</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("enviar")}
            className={cn(
              "flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "enviar"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Enviar Mensagens
          </button>
          <button
            onClick={() => setActiveTab("historico")}
            className={cn(
              "flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "historico"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Histórico
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={cn(
              "flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "config"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configurações
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "enviar" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar aluno ou turma..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="todos">Todos</option>
                    <option value="critico">Crítico</option>
                    <option value="pendente">Pendente</option>
                    <option value="enviado">Enviado</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
              </div>

              {/* Template Selection */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Selecione o Template da Mensagem
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {templatesMessages.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <p className="font-medium text-sm">{template.nome}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.mensagem}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alunos List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAlunos.length === filteredAlunos.length}
                      onChange={selectAllAlunos}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-muted-foreground">
                      Selecionar todos ({filteredAlunos.length})
                    </span>
                  </div>
                  {selectedAlunos.length > 0 && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                      <Send className="w-4 h-4" />
                      Enviar para {selectedAlunos.length} selecionado(s)
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredAlunos.map((aluno) => (
                    <div
                      key={aluno.id}
                      className={cn(
                        "p-4 bg-card rounded-lg border transition-all",
                        selectedAlunos.includes(aluno.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAlunos.includes(aluno.id)}
                          onChange={() => toggleSelectAluno(aluno.id)}
                          className="w-4 h-4 rounded border-border mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h4 className="font-medium">{aluno.nome}</h4>
                              <p className="text-sm text-muted-foreground">
                                {aluno.turma}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium border",
                                getStatusColor(aluno.status)
                              )}
                            >
                              {getStatusLabel(aluno.status)}
                            </span>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Frequência:
                              </span>
                              <span
                                className={cn(
                                  "ml-1 font-semibold",
                                  aluno.frequencia < 70
                                    ? "text-destructive"
                                    : aluno.frequencia < 80
                                    ? "text-warning"
                                    : "text-foreground"
                                )}
                              >
                                {aluno.frequencia}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Faltas consecutivas:
                              </span>
                              <span className="ml-1 font-semibold text-destructive">
                                {aluno.faltasConsecutivas}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground truncate">
                                {aluno.telefone}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground truncate">
                                {aluno.responsavel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "historico" && (
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Histórico de mensagens enviadas</p>
                <p className="text-sm">
                  Visualize todas as comunicações realizadas
                </p>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-card rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Maria Silva</span>
                      <span className="text-xs text-muted-foreground">
                        28/04/2026 - 14:32
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Alerta de frequência enviado para o responsável de João
                      Pedro Silva
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-xs text-success">Lido</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "config" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Regras de Disparo Automático</h3>
                <button
                  onClick={() => setExpandedConfig(!expandedConfig)}
                  className="text-sm text-primary flex items-center gap-1"
                >
                  {expandedConfig ? "Recolher" : "Expandir"}
                  {expandedConfig ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {configRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 bg-card rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            rule.ativo ? "bg-success" : "bg-muted"
                          )}
                        />
                        <div>
                          <h4 className="font-medium">{rule.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {rule.condicao} → {rule.acao}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.ativo}
                          className="sr-only peer"
                          readOnly
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium">Integração WhatsApp</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure sua API do WhatsApp Business para habilitar o
                      disparo automático de mensagens. As mensagens serão
                      enviadas diretamente para o número cadastrado do
                      responsável.
                    </p>
                    <button className="mt-3 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                      Configurar Integração
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
