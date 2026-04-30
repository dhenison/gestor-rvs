"use client"

import { useState } from "react"
import {
  Users,
  UserCheck,
  UserX,
  Percent,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react"

const kpiData = [
  {
    label: "Alunos Esperados",
    value: "847",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  {
    label: "Presentes",
    value: "792",
    subLabel: "Entrada Consolidada",
    icon: UserCheck,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
  },
  {
    label: "Ausentes",
    value: "55",
    subLabel: "Entrada Consolidada",
    icon: UserX,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
  {
    label: "Frequência Final",
    value: "93.5%",
    subLabel: "Baseada no Fechamento",
    icon: Percent,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
  },
  {
    label: "Ocorrências",
    value: "12",
    subLabel: "Do Turno Selecionado",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
  },
]

const turmasData = [
  { turma: "1º Ano A", entrada: "Feita", saida: "Feita", presenca: "96%" },
  { turma: "1º Ano B", entrada: "Feita", saida: "Pendente", presenca: "94%" },
  { turma: "2º Ano A", entrada: "Feita", saida: "Feita", presenca: "92%" },
  { turma: "2º Ano B", entrada: "Feita", saida: "Feita", presenca: "95%" },
  { turma: "3º Ano A", entrada: "Pendente", saida: "Pendente", presenca: "-" },
  { turma: "3º Ano B", entrada: "Feita", saida: "Pendente", presenca: "91%" },
]

const ocorrenciasRecentes = [
  { aluno: "João Silva", tipo: "Advertência Verbal", hora: "08:45" },
  { aluno: "Maria Santos", tipo: "Atraso", hora: "07:20" },
  { aluno: "Pedro Oliveira", tipo: "Advertência Escrita", hora: "10:30" },
]

export function DashboardContent() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [selectedTurno, setSelectedTurno] = useState("Todos")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
          <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">
            Dashboard Gerencial
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Data de Referência
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Filtro por Turno
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={selectedTurno}
                onChange={(e) => setSelectedTurno(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="Todos">Todos os Turnos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {kpiData.map((kpi, index) => (
          <div
            key={index}
            className={`bg-card rounded-xl p-4 border ${kpi.borderColor} hover:scale-[1.02] transition-transform cursor-default`}
          >
            <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              {kpi.label}
            </p>
            {kpi.subLabel && (
              <p className="text-[10px] text-muted-foreground/70 mb-1">
                {kpi.subLabel}
              </p>
            )}
            <p className={`text-2xl lg:text-3xl font-bold ${kpi.color}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Turmas Table */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Status das Turmas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Turma
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                    Entrada
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                    Saída
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                    % Presença
                  </th>
                </tr>
              </thead>
              <tbody>
                {turmasData.map((turma, index) => (
                  <tr
                    key={index}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="p-3 font-medium">{turma.turma}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          turma.entrada === "Feita"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {turma.entrada}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          turma.saida === "Feita"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {turma.saida}
                      </span>
                    </td>
                    <td className="p-3 text-center font-semibold text-primary">
                      {turma.presenca}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ocorrências */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-warning">Últimas Ocorrências</h3>
          </div>
          <div className="p-4 space-y-3">
            {ocorrenciasRecentes.map((oc, index) => (
              <div
                key={index}
                className="p-3 bg-muted/50 rounded-lg border border-border"
              >
                <p className="font-medium text-sm">{oc.aluno}</p>
                <p className="text-xs text-muted-foreground">{oc.tipo}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {oc.hora}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
