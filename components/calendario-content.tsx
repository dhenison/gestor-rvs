"use client"

import { useState } from "react"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  PartyPopper,
  Clock,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mesesNomes = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

// Mock de eventos
const eventosMock: Record<string, { tipo: string; descricao: string }> = {
  "2026-04-21": { tipo: "feriado", descricao: "Tiradentes" },
  "2026-04-25": { tipo: "evento", descricao: "Feira de Ciências" },
  "2026-05-01": { tipo: "feriado", descricao: "Dia do Trabalho" },
  "2026-05-15": { tipo: "avaliacao", descricao: "Prova Bimestral" },
}

export function CalendarioContent() {
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()

  const mesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11)
      setAnoAtual(anoAtual - 1)
    } else {
      setMesAtual(mesAtual - 1)
    }
  }

  const mesProximo = () => {
    if (mesAtual === 11) {
      setMesAtual(0)
      setAnoAtual(anoAtual + 1)
    } else {
      setMesAtual(mesAtual + 1)
    }
  }

  const getEventoColor = (tipo: string) => {
    switch (tipo) {
      case "feriado":
        return "bg-destructive text-destructive-foreground"
      case "evento":
        return "bg-primary text-primary-foreground"
      case "avaliacao":
        return "bg-accent text-accent-foreground"
      case "sabado":
        return "bg-warning text-warning-foreground"
      default:
        return "bg-success text-success-foreground"
    }
  }

  const renderDias = () => {
    const dias = []
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(<div key={`empty-${i}`} className="aspect-square" />)
    }
    
    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const strMes = (mesAtual + 1).toString().padStart(2, "0")
      const strDia = dia.toString().padStart(2, "0")
      const dataStr = `${anoAtual}-${strMes}-${strDia}`
      const evento = eventosMock[dataStr]
      const dayOfWeek = new Date(anoAtual, mesAtual, dia).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      dias.push(
        <div
          key={dia}
          className={cn(
            "aspect-square p-1 sm:p-2 rounded-lg border cursor-pointer transition-all hover:scale-105",
            evento
              ? getEventoColor(evento.tipo)
              : isWeekend
              ? "bg-muted/50 border-border text-muted-foreground"
              : "bg-card border-border hover:border-primary/50"
          )}
        >
          <span className="text-xs sm:text-sm font-medium">{dia}</span>
          {evento && (
            <p className="hidden sm:block text-[10px] mt-1 truncate">
              {evento.descricao}
            </p>
          )}
        </div>
      )
    }
    
    return dias
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
          <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">
            Calendário Letivo
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">200</p>
              <p className="text-xs text-muted-foreground">Dias Letivos</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">12</p>
              <p className="text-xs text-muted-foreground">Feriados</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">8</p>
              <p className="text-xs text-muted-foreground">Eventos</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">4</p>
              <p className="text-xs text-muted-foreground">Sábados Letivos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <button
            onClick={mesAnterior}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {mesesNomes[mesAtual]} {anoAtual}
          </h2>
          <button
            onClick={mesProximo}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {dia}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {renderDias()}
          </div>
        </div>

        {/* Legenda */}
        <div className="p-4 border-t border-border">
          <h3 className="text-sm font-medium mb-3">Legenda</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span className="text-xs text-muted-foreground">Dia Letivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive" />
              <span className="text-xs text-muted-foreground">Feriado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span className="text-xs text-muted-foreground">Evento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent" />
              <span className="text-xs text-muted-foreground">Avaliação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning" />
              <span className="text-xs text-muted-foreground">Sábado Letivo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
