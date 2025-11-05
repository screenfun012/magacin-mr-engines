import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/state/authStore';
import { useThemeStore } from '@/lib/state/themeStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, Package, FileText, Settings, LogOut, Moon, Sun } from 'lucide-react';
import mrSmallLogo from '@/assets/logos/mr-small.png';

export function Sidebar({ activeView, onViewChange }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'inventory', label: 'Magacin', icon: Package, adminOnly: false },
    { id: 'export', label: 'Izvoz i uvoz', icon: FileText, adminOnly: false },
    { id: 'admin', label: 'Admin Panel', icon: Settings, adminOnly: true },
  ];

  const filteredItems = menuItems.filter((item) => !item.adminOnly || isAdmin());

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex flex-col items-center space-y-2">
          <img src={mrSmallLogo} alt="MR Engines" className="w-16 h-16 object-contain" />
          <div className="text-center">
            <h1 className="text-lg font-bold">Magacin</h1>
            <p className="text-xs text-muted-foreground">MR Engines</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between px-2 py-3 mb-3">
          <div className="flex-1">
            <p className="font-semibold text-sm">{user?.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-all duration-300 group"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-all duration-300 group-hover:rotate-12" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-all duration-300 group-hover:rotate-90" />
            )}
          </button>
        </div>
        <Button variant="outline" className="w-full" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Odjavi se
        </Button>
      </div>
    </div>
  );
}
