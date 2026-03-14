import { Building2 } from 'lucide-react'

const DEPARTMENTS = [
  { id: 'F&B', label: 'F&B', icon: '🍽', color: 'bg-orange-500' },
  { id: 'Manufacturing', label: 'Manufacturing', icon: '🏭', color: 'bg-blue-500' },
  { id: 'IT', label: 'IT', icon: '💻', color: 'bg-violet-500' },
  { id: 'IT Helpdesk', label: 'IT Helpdesk', icon: '🎧', color: 'bg-cyan-500' },
  { id: 'Finance', label: 'Finance', icon: '💰', color: 'bg-emerald-500' },
  { id: 'HR', label: 'HR', icon: '👥', color: 'bg-pink-500' },
]

export default function DepartmentSelector({ selected, onSelect }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mr-2">
        <Building2 size={12} />
        <span>Context</span>
      </div>
      {DEPARTMENTS.map(dept => {
        const active = selected === dept.id
        return (
          <button
            key={dept.id}
            onClick={() => onSelect(active ? null : dept.id)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
              transition-all duration-200 cursor-pointer border
              ${active
                ? 'bg-gray-900 text-white border-gray-900 shadow-md shadow-gray-900/10'
                : 'bg-white text-gray-500 border-gray-200/80 hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <span>{dept.icon}</span>
            {dept.label}
            {active && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft ml-0.5" />
            )}
          </button>
        )
      })}
      {selected && (
        <button
          onClick={() => onSelect(null)}
          className="text-[10px] text-gray-400 hover:text-red-400 ml-1 cursor-pointer transition-colors"
        >
          clear
        </button>
      )}
    </div>
  )
}
