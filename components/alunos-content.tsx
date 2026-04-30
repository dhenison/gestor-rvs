"use client"

import { useState } from "react"
import {
  Users,
  Search,
  Plus,
  Camera,
  User,
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const alunosMock = [
  {
    id: 1,
    nome: "João Pedro Silva",
    cpf: "123.456.789-00",
    turma: "1º Ano A",
    idade: 15,
    telefone: "(91) 98765-4321",
    email: "joao@email.com",
    nomeMae: "Maria Silva",
    nomePai: "José Silva",
    foto: null,
  },
  {
    id: 2,
    nome: "Ana Carolina Santos",
    cpf: "987.654.321-00",
    turma: "2º Ano B",
    idade: 16,
    telefone: "(91) 99876-5432",
    email: "ana@email.com",
    nomeMae: "Paula Santos",
    nomePai: "Carlos Santos",
    foto: null,
  },
  {
    id: 3,
    nome: "Lucas Oliveira",
    cpf: "456.789.123-00",
    turma: "1º Ano B",
    idade: 15,
    telefone: "(91) 98123-4567",
    email: "lucas@email.com",
    nomeMae: "Carla Oliveira",
    nomePai: "Pedro Oliveira",
    foto: null,
  },
]

export function AlunosContent() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAluno, setSelectedAluno] = useState<typeof alunosMock[0] | null>(null)

  const filteredAlunos = alunosMock.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.turma.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
          <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">
            Gestão de Alunos
          </h1>
        </div>
      </div>

      {/* Cadastrar Novo */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-primary font-medium">
            <Plus className="w-5 h-5" />
            Cadastrar Novo Aluno
          </div>
          {showForm ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {showForm && (
          <div className="p-4 border-t border-border">
            <form className="space-y-4">
              {/* Foto */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Capturar/Galeria
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    CPF do Aluno
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do aluno"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Turma
                  </label>
                  <select className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Selecione...</option>
                    <option value="1A">1º Ano A</option>
                    <option value="1B">1º Ano B</option>
                    <option value="2A">2º Ano A</option>
                    <option value="2B">2º Ano B</option>
                    <option value="3A">3º Ano A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nome da Mãe
                  </label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nome do Pai
                  </label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                Salvar Aluno
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Pesquisar */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium mb-3">Pesquisar Aluno</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Digite o nome do aluno"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Resultados */}
        {searchTerm && (
          <div className="mt-4 space-y-2">
            {filteredAlunos.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum aluno encontrado
              </p>
            ) : (
              filteredAlunos.map((aluno) => (
                <button
                  key={aluno.id}
                  onClick={() => setSelectedAluno(aluno)}
                  className={cn(
                    "w-full p-4 bg-muted/50 rounded-lg border text-left transition-all hover:border-primary/50",
                    selectedAluno?.id === aluno.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{aluno.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {aluno.turma}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Detalhes do Aluno */}
      {selectedAluno && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Detalhes do Aluno</h3>
            <button
              onClick={() => setSelectedAluno(null)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-muted border-2 border-primary flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <button className="mt-2 text-sm text-primary hover:underline">
                  Alterar Foto
                </button>
              </div>
              <div className="flex-1 grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="font-medium">{selectedAluno.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Turma</p>
                    <p className="font-medium">{selectedAluno.turma}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedAluno.telefone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">E-mail</p>
                    <p className="font-medium">{selectedAluno.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nome da Mãe</p>
                    <p className="font-medium">{selectedAluno.nomeMae}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nome do Pai</p>
                    <p className="font-medium">{selectedAluno.nomePai}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
