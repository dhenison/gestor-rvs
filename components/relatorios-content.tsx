"use client"

import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Printer,
} from "lucide-react"
import { cn } from "@/lib/utils"

const relatoriosDisponiveis = [
  {
    id: 1,
    nome: "Frequência por Turma",
    descricao: "Relatório detalhado de presença por turma e período",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 2,
    nome: "Frequência Individual",
    descricao: "Histórico de frequência individual do aluno",
    icon: FileText,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: 3,
    nome: "Ocorrências Disciplinares",
    descricao: "Listagem de ocorrências por período",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    id: 4,
    nome: "Boletim de Frequência",
    descricao: "Boletim mensal para envio aos responsáveis",
    icon: Calendar,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: 5,
    nome: "Relatório Pé-de-Meia",
    descricao: "Controle de assiduidade para o programa",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 6,
    nome: "Alunos em Risco",
    descricao: "Lista de alunos com frequência abaixo de 75%",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
]

export function RelatoriosContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
          <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">
            Relatórios
          </h1>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-primary">847</p>
          <p className="text-xs text-muted-foreground">Alunos Ativos</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-success">93.5%</p>
          <p className="text-xs text-muted-foreground">Frequência Média</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-warning">45</p>
          <p className="text-xs text-muted-foreground">Ocorrências do Mês</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-destructive">12</p>
          <p className="text-xs text-muted-foreground">Alunos em Risco</p>
        </div>
      </div>

      {/* Relatórios Disponíveis */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Relatórios Disponíveis</h2>
          <p className="text-sm text-muted-foreground">
            Selecione um relatório para gerar ou visualizar
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {relatoriosDisponiveis.map((relatorio) => (
            <div
              key={relatorio.id}
              className="p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    relatorio.bgColor
                  )}
                >
                  <relatorio.icon className={cn("w-5 h-5", relatorio.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{relatorio.nome}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {relatorio.descricao}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                  <Download className="w-3 h-3" />
                  PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-success/10 text-success rounded-lg text-xs font-medium hover:bg-success/20 transition-colors">
                  <Download className="w-3 h-3" />
                  Excel
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs font-medium transition-colors">
                  <Printer className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros para Geração */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold mb-4">Filtros para Geração</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Período
            </label>
            <select className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="mes">Mês Atual</option>
              <option value="bimestre">Bimestre Atual</option>
              <option value="semestre">Semestre</option>
              <option value="ano">Ano Letivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Turno
            </label>
            <select className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Todos</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noite">Noite</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Turma
            </label>
            <select className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Todas</option>
              <option value="1A">1º Ano A</option>
              <option value="1B">1º Ano B</option>
              <option value="2A">2º Ano A</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
