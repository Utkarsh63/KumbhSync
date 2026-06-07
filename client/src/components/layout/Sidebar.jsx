import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GitBranch, Zap } from 'lucide-react';
import { useSocketConnection } from '../../hooks/useSocket.js';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/volunteers', icon: Users, label: 'Volunteers' },
  { to: '/deployments', icon: GitBranch, label: 'Deployments' },
];

export default function Sidebar() {
  const connected = useSocketConnection();

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-16 hover:w-60 transition-all duration-300 ease-in-out group glass-heavy flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 shrink-0 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="ml-3 text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          KumbhSync
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border-l-2 border-transparent'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Connection Status */}
      <div className="px-4 py-4 border-t border-white/5 flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${connected ? 'bg-accent-green animate-pulse-dot' : 'bg-accent-red'}`} />
        <span className="text-xs text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </aside>
  );
}
