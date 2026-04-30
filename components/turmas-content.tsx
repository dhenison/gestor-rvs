"use client"

import { useState } from "react"
import {
  GraduationCap,
  Plus,
  ChevronDown,
  ChevronUp,
  Users,
  Sun,
  Sunset,
  Moon,
  ArrowLeftRight,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const turnosTabs = [
  { id: "Manhã", label: "Manhã", icon: Sun },
  { id: "Tarde", label: "Tarde", icon: Sunset },
  { id: "Noite", label: "Noite", icon: Moon },
]

const turmasMock = {
  Manhã: [
    { nome: "1º Ano A", alunos: 32, serie: "Ensino Médio" },
    { nome: "1º Ano B", alunos: 30, serie: "Ensino Médio" },
    { nome: "2º Ano A", alunos: 28, serie: "Ensino Médio" },
    { nome: "2º Ano B", alunos: 31, serie: "Ensino Médio" },
  ],
  Tarde: [
    { nome: "1º Ano C", alunos: 29, serie: "Ensino Médio" },
    { nome: "2º Ano C", alunos: 27, serie: "Ensino Médio" },
    { nome: "3º Ano A", alunos: 25, serie: "Ensino Médio" },
  ],
  Noite: [
    { nome: "EJA 1", alunos: 20, serie: "EJA" },
    { nome: "EJA 2", alunos: 18, serie: "EJA" },
  ],
}

const alunosTurmaMock = [
  { nome: "Ana Paula Silva", cpf: "123.456.789-00", telefone: "(91) 98765-4321", whatsapp: "Ativo" },
  { nome: "Bruno Costa", cpf: "234.567.890-11", telefone: "(91) 99876-5432", whatsapp: "Ativo" },
  { nome: "Carla Mendes", cpf: "345.678.901-22", telefone: "(91) 98234-5678", whatsapp: "Inativo" },
  { nome: "Daniel Oliveira", cpf: "456.789.012-33", telefone: "(91) 97654-3210", whatsapp: "Ativo" },
  { nome: "Eduarda Santos", cpf: "567.890.123-44", telefone: "(91) 96543-2109", whatsapp: "Ativo" },
]

export function TurmasContent() {
  const [showForm, setShowForm] = useState(false)
  const [selectedTurno, setSelectedTurno] = useState("Manhã")
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null)

  const turmas = turmasMock[selectedTurno as keyof typeof turmasMock] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
          <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">
            Gestão de Turmas
          </h1>
        </div>
      </div>

      {/* Cadastrar Nova Turma */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-primary font-medium">
            <Plus className="w-5 h-5" />
            Cadastrar Nova Turma
          </div>
          {showForm ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {showForm && (
          <div className="p-4 border-t border-border">
            <form className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome da Turma
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1º Ano A"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Turno
                </label>
                <select className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Selecione...</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Série/Nível
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ensino Médio"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Ano Letivo
                </label>
                <input
                  type="number"
                  defaultValue={2026}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  Salvar Turma
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Painel Principal */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold mb-3">1. Selecione o Turno</h3>
          <div className="flex gap-2 flex-wrap">
            {turnosTabs.map((turno) => (
              <button
                key={turno.id}
                onClick={() => {
                  setSelectedTurno(turno.id)
                  setSelectedTurma(null)
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedTurno === turno.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <turno.icon className="w-4 h-4" />
                {turno.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <h3 className="font-semibold mb-3">2. Selecione a Turma</h3>
          <div className="flex gap-2 flex-wrap">
            {turmas.map((turma) => (
              <button
                key={turma.nome}
                onClick={() => setSelectedTurma(turma.nome)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedTurma === turma.nome
                    ? "bg-primary text-primary-foreground ring-2 ring-accent"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {turma.nome}
                <span className="ml-2 text-xs opacity-70">({turma.alunos})</span>
              </button>
            ))}
          </div>
        </div>

        {selectedTurma && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                3. Alunos Matriculados:{" "}
                <span className="text-accent">{selectedTurma}</span>
              </h3>
              <button className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Nome do Aluno
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      CPF
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Telefone
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      WhatsApp
                    </th>
                    <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {alunosTurmaMock.map((aluno, index) => (
                    <tr key={index} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3 font-medium">{aluno.nome}</td>
                      <td className="p-3 text-muted-foreground">{aluno.cpf}</td>
                      <td className="p-3 text-muted-foreground">{aluno.telefone}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            aluno.whatsapp === "Ativo"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {aluno.whatsapp}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Transferir de Turma"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
