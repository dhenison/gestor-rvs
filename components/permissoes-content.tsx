"use client"

import { useState } from "react"
import {
  Settings,
  User,
  Shield,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const usuariosMock = [
  {
    id: 1,
    nome: "Administrador",
    email: "admin@escola.seduc.pa.gov.br",
    perfil: "Manager",
    modulos: ["dashboard", "alunos", "turmas", "frequencia", "ocorrencias", "mensagens", "calendario", "relatorios", "permissoes"],
    ativo: true,
  },
  {
    id: 2,
    nome: "Coordenador",
    email: "coordenador@escola.seduc.pa.gov.br",
    perfil: "Coordinator",
    modulos: ["dashboard", "alunos", "turmas", "frequencia", "ocorrencias", "relatorios"],
    ativo: true,
  },
  {
    id: 3,
    nome: "Professor",
    email: "professor@escola.seduc.pa.gov.br",
    perfil: "Teacher",
    modulos: ["dashboard", "frequencia"],
    ativo: true,
  },
]

const modulosDisponiveis = [
  { id: "dashboard", nome: "Dashboard" },
  { id: "alunos", nome: "Alunos" },
  { id: "turmas", nome: "Turmas" },
  { id: "frequencia", nome: "Frequência" },
  { id: "ocorrencias", nome: "Ocorrências" },
  { id: "mensagens", nome: "Mensagens" },
  { id: "calendario", nome: "Calendário" },
  { id: "relatorios", nome: "Relatórios" },
  { id: "permissoes", nome: "Permissões" },
]

export function PermissoesContent() {
  const [usuarios, setUsuarios] = useState(usuariosMock)
  const [selectedUser, setSelectedUser] = useState<typeof usuariosMock[0] | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
          <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">
            Gerenciamento de Permissões
          </h1>
        </div>
      </div>

      {/* Adicionar Usuário */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors">
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Usuários do Sistema</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                  Usuário
                </th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                  E-mail
                </th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                  Perfil
                </th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-t border-border hover:bg-muted/30"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{usuario.nome}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground text-sm">
                    {usuario.email}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        usuario.perfil === "Manager"
                          ? "bg-accent/10 text-accent"
                          : usuario.perfil === "Coordinator"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {usuario.perfil}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        usuario.ativo
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedUser(usuario)}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                        title="Editar Permissões"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Permissões */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Permissões de {selectedUser.nome}</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os módulos que este usuário pode acessar:
              </p>
              <div className="space-y-2">
                {modulosDisponiveis.map((modulo) => {
                  const hasAccess = selectedUser.modulos.includes(modulo.id)
                  return (
                    <label
                      key={modulo.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                        hasAccess
                          ? "bg-primary/5 border-primary/30"
                          : "border-border hover:border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          readOnly
                          className="w-4 h-4 rounded"
                        />
                        <span className="font-medium text-sm">{modulo.nome}</span>
                      </div>
                      {hasAccess && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </label>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
