import { NavLink } from 'react-router-dom';
import { 
  BookText, 
  Users, 
  Map, 
  History, 
  Sparkles, 
  Download, 
  Settings,
  Sword,
  Layout,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { auth, logout } from '../lib/firebase';

const NAV_ITEMS = [
  { icon: BookText, label: 'Editor', path: '/editor' },
  { icon: Users, label: 'Characters', path: '/characters' },
  { icon: Map, label: 'World', path: '/world' },
  { icon: History, label: 'Timeline', path: '/timeline' },
  { icon: Layout, label: 'Moodboard', path: '/moodboard' },
  { icon: Sparkles, label: 'Grimoire AI', path: '/ai' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const user = auth.currentUser;

  const exportGrimoire = () => {
    const data = localStorage.getItem('ethereal_ink_state');
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grimoire-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importGrimoire = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re) => {
        const content = re.target?.result as string;
        localStorage.setItem('ethereal_ink_state', content);
        window.location.reload();
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <aside className={cn(
      "bg-goth-charcoal border-r border-goth-blood/20 flex flex-col z-50 transition-all duration-500 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-24 bg-goth-blood text-white p-1 rounded-full border border-goth-ink shadow-lg z-[60] hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={cn("p-8 pb-4", isCollapsed && "p-4 flex flex-col items-center")}>
        <div className={cn("flex items-center gap-3 text-goth-ink mb-2", isCollapsed && "gap-0")}>
          <Sword className={cn("w-8 h-8 transition-all", isCollapsed && "w-6 h-6")} />
          {!isCollapsed && <h1 className="text-2xl font-serif tracking-widest uppercase">Ethereal</h1>}
        </div>
        {!isCollapsed && <p className="text-[10px] uppercase tracking-[0.2em] text-goth-blood opacity-60 font-semibold">Ink & Whispers</p>}
      </div>

      {user && (
        <div className={cn("px-6 mb-4", isCollapsed && "px-2 text-center")}>
          <div className={cn("flex items-center gap-3 p-2 bg-black/20 rounded-xl border border-white/5", isCollapsed && "justify-center")}>
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
              alt={user.displayName || ''} 
              className="w-8 h-8 rounded-full border border-goth-blood/30"
            />
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-serif text-goth-ink truncate">{user.displayName}</p>
                <p className="text-[8px] uppercase tracking-tighter text-goth-paper/30 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className={cn("flex-1 mt-4 space-y-2", isCollapsed ? "px-2" : "px-4")}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => cn(
              "flex items-center gap-4 py-3 rounded-lg transition-all duration-300 group",
              isCollapsed ? "justify-center px-0" : "px-4",
              isActive 
                ? "bg-goth-blood/10 text-goth-ink border border-goth-blood/30 parchment-glow" 
                : "text-goth-paper/50 hover:text-goth-paper hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
              "group-hover:text-goth-ink"
            )} />
            {!isCollapsed && <span className="font-serif text-lg tracking-wide">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={cn("p-6 border-t border-goth-blood/10 space-y-4", isCollapsed && "p-2 items-center flex flex-col")}>
        <button 
          onClick={logout}
          title={isCollapsed ? "Seal the Sanctum" : undefined}
          className={cn("w-full flex items-center gap-3 px-4 py-2 text-sm text-goth-paper/60 hover:text-goth-blood transition-colors group", isCollapsed && "justify-center px-0")}
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span>Seal the Sanctum</span>}
        </button>
        <button 
          onClick={exportGrimoire}
          title={isCollapsed ? "Export Manuscript" : undefined}
          className={cn("w-full flex items-center gap-3 px-4 py-2 text-sm text-goth-paper/60 hover:text-goth-paper transition-colors group", isCollapsed && "justify-center px-0")}
        >
          <Download className="w-4 h-4 group-hover:text-goth-ink transition-colors" />
          {!isCollapsed && <span>Export Manuscript</span>}
        </button>
      </div>
    </aside>
  );
}
