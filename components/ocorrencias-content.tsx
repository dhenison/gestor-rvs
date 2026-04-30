"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Filter,
  Plus,
  ArrowLeft,
  Calendar,
  User,
  Users,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

const alunosMock = [
  { id: 1, nome: "João Pedro Silva", turma: "1º Ano A" },
  { id: 2, nome: "Ana Carolina Santos", turma: "2º Ano B" },
  { id: 3, nome: "Lucas Oliveira", turma: "1º Ano B" },
  { id: 4, nome: "Mariana Costa", turma: "3º Ano A" },
]

export function OcorrenciasContent() {
  const [view, setView] = useState<"lista" | "form">("lista")
  const [selectedTurno, setSelectedTurno] = useState("")
  const [selectedTurma, setSelectedTurma] = useState("")
  const [selectedAluno, setSelectedAluno] = useState<typeof alunosMock[0] | null>(null)

  const filteredAlunos = alunosMock.filter((a) => !selectedTurma || a.turma.includes("Ano"))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-warning/20 rounded-xl p-4 lg:p-6 border border-warning/30">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-warning" />
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">
            Ocorrências Disciplinares
          </h1>
        </div>
      </div>

      {view === "lista" && (
        <>
          {/* Filtros */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Turno
                </label>
                <select
                  value={selectedTurno}
                  onChange={(e) => setSelectedTurno(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos os Turnos</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Turma
                </label>
                <select
                  value={selectedTurma}
                  onChange={(e) => setSelectedTurma(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione o Turno Primeiro...</option>
                  {selectedTurno && (
                    <>
                      <option value="1A">1º Ano A</option>
                      <option value="1B">1º Ano B</option>
                      <option value="2A">2º Ano A</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Alunos */}
          <div className="space-y-3">
            {filteredAlunos.map((aluno) => (
              <div
                key={aluno.id}
                className="bg-card p-4 rounded-xl border border-border flex items-center justify-between hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{aluno.nome}</p>
                    <p className="text-sm text-muted-foreground">{aluno.turma}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedAluno(aluno)
                    setView("form")
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning rounded-lg text-sm font-medium hover:bg-warning/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Registrar
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "form" && selectedAluno && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Registrar Ocorrência</h2>
            <button
              onClick={() => setView("lista")}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>

          <div className="p-4">
            <div className="bg-muted/50 rounded-lg p-4 border border-border mb-6">
              <p className="text-sm text-muted-foreground">Aluno Selecionado:</p>
              <h3 className="font-semibold text-lg">{selectedAluno.nome}</h3>
              <p className="text-sm text-muted-foreground">{selectedAluno.turma}</p>
            </div>

            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Data do Ocorrido
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Tipo de Ocorrência
                  </label>
                  <select className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Selecione o tipo...</option>
                    <option value="verbal">Advertência Verbal</option>
                    <option value="escrita">Advertência Escrita</option>
                    <option value="suspensao">Suspensão</option>
                    <option value="atraso">Atraso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Descrição do Ocorrido
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva os detalhes da ocorrência..."
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Notificar os Responsáveis?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="notificar"
                        value="sim"
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="notificar"
                        value="nao"
                        defaultChecked
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Não</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Responsável pelo Cadastro
                  </label>
                  <input
                    type="text"
                    value="Administrador"
                    readOnly
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 text-right">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-warning text-warning-foreground rounded-lg font-medium hover:bg-warning/90 transition-colors"
                >
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
