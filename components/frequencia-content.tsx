"use client"

import { useState } from "react"
import {
  ClipboardCheck,
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

const alunosChamada = [
  { id: 1, nome: "Ana Paula Silva", entrada: true, saida: true, justificativa: "" },
  { id: 2, nome: "Bruno Costa", entrada: true, saida: true, justificativa: "" },
  { id: 3, nome: "Carla Mendes", entrada: false, saida: false, justificativa: "Atestado médico" },
  { id: 4, nome: "Daniel Oliveira", entrada: true, saida: true, justificativa: "" },
  { id: 5, nome: "Eduarda Santos", entrada: true, saida: false, justificativa: "" },
  { id: 6, nome: "Felipe Rodrigues", entrada: true, saida: true, justificativa: "" },
  { id: 7, nome: "Gabriela Lima", entrada: false, saida: false, justificativa: "" },
  { id: 8, nome: "Henrique Alves", entrada: true, saida: true, justificativa: "" },
]

export function FrequenciaContent() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [selectedTurno, setSelectedTurno] = useState("")
  const [selectedTurma, setSelectedTurma] = useState("")
  const [chamada, setChamada] = useState(alunosChamada)
  const [pendingSync, setPendingSync] = useState(0)

  const togglePresenca = (id: number, tipo: "entrada" | "saida") => {
    setChamada((prev) =>
      prev.map((aluno) =>
        aluno.id === id ? { ...aluno, [tipo]: !aluno[tipo] } : aluno
      )
    )
  }

  const marcarTodosPresentes = () => {
    setChamada((prev) =>
      prev.map((aluno) => ({ ...aluno, entrada: true, saida: true }))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
          <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">
            Diário de Frequência
          </h1>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              pendingSync > 0 ? "bg-warning animate-pulse" : "bg-success"
            )}
          />
          <span className="text-sm font-medium">
            {pendingSync > 0
              ? `Pendente: ${pendingSync} Chamadas`
              : "Tudo Sincronizado"}
          </span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
          <RefreshCw className="w-4 h-4 text-primary" />
          Sincronizar Agora
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold mb-4">Filtros de Chamada</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Data da Chamada
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
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Turno
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={selectedTurno}
                onChange={(e) => setSelectedTurno(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="">Selecione...</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Turma
            </label>
            <select
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="">Selecione o Turno primeiro...</option>
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
      {selectedTurma && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-4">
            <h3 className="font-semibold">Lista de Alunos</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={marcarTodosPresentes}
                className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg text-sm font-medium hover:bg-success/20 transition-colors"
              >
                <Check className="w-4 h-4" />
                Presença para Todos
              </button>
              <button className="px-4 py-2 bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary transition-colors">
                Consolidar Entrada
              </button>
              <button className="px-4 py-2 bg-destructive/90 text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive transition-colors">
                Consolidar Saída
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground w-[40%]">
                    Nome do Aluno
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                    Entrada
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                    Saída
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Falta Justificada
                  </th>
                </tr>
              </thead>
              <tbody>
                {chamada.map((aluno) => (
                  <tr key={aluno.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-medium">{aluno.nome}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => togglePresenca(aluno.id, "entrada")}
                          className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            aluno.entrada
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <CheckCircle className="w-4 h-4" />
                          P
                        </button>
                        <button
                          onClick={() => togglePresenca(aluno.id, "entrada")}
                          className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            !aluno.entrada
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <XCircle className="w-4 h-4" />
                          F
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => togglePresenca(aluno.id, "saida")}
                          className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            aluno.saida
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <CheckCircle className="w-4 h-4" />
                          P
                        </button>
                        <button
                          onClick={() => togglePresenca(aluno.id, "saida")}
                          className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            !aluno.saida
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <XCircle className="w-4 h-4" />
                          F
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="Motivo (opcional)"
                        defaultValue={aluno.justificativa}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedTurma && (
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Preencha os filtros acima para carregar os alunos.
          </p>
        </div>
      )}
    </div>
  )
}
