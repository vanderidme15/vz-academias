"use client"

import { Team } from "@/lib/constants/teams"
import { useMemo, useState } from "react"

interface TeamsGrid {
  teams: Team[],
  hoveredTeam: string | null,
  setHoveredTeam: (team: string | null) => void
}

export default function TeamsGrid({ teams, hoveredTeam, setHoveredTeam }: TeamsGrid) {

  const teamsLeft = useMemo(() => teams.slice(0, 4), [])
  const teamsCenter = useMemo(() => teams.slice(4, 8), [])
  const teamsRight = useMemo(() => teams.slice(8, 12), [])

  return (
    <div className="grid grid-cols-3 gap-4 h-2/6 w-full pb-12">
      {/* left */}
      <div className="w-full h-1/2 self-start flex items-center justify-center gap-4">
        {teamsLeft.map((team) => (
          <TeamCard
            key={team.name}
            team={team}
            isHovered={hoveredTeam === team.name}
            isDimmed={hoveredTeam !== null && hoveredTeam !== team.name}
            onMouseEnter={() => setHoveredTeam(team.name)}
            onMouseLeave={() => setHoveredTeam(null)}
          />
        ))}
      </div>

      {/* center */}
      <div className="w-full h-1/2 self-end flex items-center justify-center gap-2">
        {teamsCenter.map((team) => (
          <TeamCard
            key={team.name}
            team={team}
            isHovered={hoveredTeam === team.name}
            isDimmed={hoveredTeam !== null && hoveredTeam !== team.name}
            onMouseEnter={() => setHoveredTeam(team.name)}
            onMouseLeave={() => setHoveredTeam(null)}
          />
        ))}
      </div>

      {/* right */}
      <div className="w-full h-1/2 self-start flex items-center justify-center gap-2">
        {teamsRight.map((team) => (
          <TeamCard
            key={team.name}
            team={team}
            isHovered={hoveredTeam === team.name}
            isDimmed={hoveredTeam !== null && hoveredTeam !== team.name}
            onMouseEnter={() => setHoveredTeam(team.name)}
            onMouseLeave={() => setHoveredTeam(null)}
          />
        ))}
      </div>
    </div>
  )
}

interface TeamCardProps {
  team: {
    name: string
    avatarImg: string
    avatarHoverImg: string
  }
  isHovered: boolean
  isDimmed: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function TeamCard({ team, isHovered, isDimmed, onMouseEnter, onMouseLeave }: TeamCardProps) {
  return (
    <div
      className={`
        group relative w-32 h-32 rounded-lg overflow-hidden cursor-pointer
        transition-all duration-300
        hover:scale-110 hover:shadow-lg hover:z-20
        focus-visible:scale-110 focus-visible:shadow-lg focus-visible:z-20
        focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 
        focus-visible:outline-amber-400
        ${isDimmed ? 'grayscale opacity-40' : ''}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={0}
    >
      {/* Imagen principal */}
      <div className="relative overflow-hidden rounded-lg h-full w-full">
        {/* Imagen estática */}
        <img
          src={team.avatarImg}
          alt={`Tarjeta de ${team.name}`}
          className={`
            absolute inset-0 aspect-square h-full w-full 
            bg-linear-to-t from-gray-50/40 via-gray-50/20 to-transparent 
            object-cover object-top 
            transition-all duration-500
            ${isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
          `}
        />

        {/* Imagen hover */}
        <img
          src={team.avatarHoverImg}
          alt={`Tarjeta de ${team.name} (hover)`}
          className={`
            absolute inset-0 aspect-square h-full w-full 
            bg-linear-to-t from-gray-50/40 via-gray-50/20 to-transparent 
            object-cover object-top 
            transition-all duration-500
            ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}
          `}
        />

        {/* Efecto de brillo deslizante */}
        <div
          className="
            absolute inset-0 -translate-x-full 
            bg-linear-to-tr from-transparent via-white/20 to-transparent 
            transition-transform duration-700 ease-in-out 
            group-hover:translate-x-full
          "
        />

        {/* Borde que aparece en hover */}
        <div
          className="
            absolute inset-0 rounded-lg border-0 border-amber-400/70 
            opacity-0 transition-all duration-300 
            group-hover:border-2 group-hover:opacity-100
          "
        />
      </div>

      {/* Overlay con nombre */}
      <div
        className="
          absolute inset-0 flex flex-col items-center justify-end 
          rounded-lg bg-linear-to-t from-amber-950/90 via-amber-950/40 to-transparent 
          p-2 opacity-0 translate-y-2 
          transition-all duration-300 
          group-hover:translate-y-0 group-hover:opacity-100
        "
      >
        {/* <h3 className="text-pink-400 text-xs font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {team.name}
        </h3> */}
      </div>
    </div>
  )
}