import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileUp, Blocks, Activity } from 'lucide-react';
import Logo from '../Logo';
import AuthButton from '../AuthButton';

const tabs = [
  { to: '/register', icon: FileUp, label: 'Register' },
  { to: '/verify', icon: ShieldCheck, label: 'Verify' },
  { to: '/explorer', icon: Blocks, label: 'Media' },
  { to: '/activity', icon: Activity, label: 'Activity' },
];

export default function MobileLayout() {
  const location = useLocation();

  return (
    <div className="min-h-[100dvh] bg-void flex flex-col">
      {/* Status-bar-aware top bar */}
      <header className="bg-surface/95 backdrop-blur-2xl border-b border-rule px-4 pt-[env(safe-area-inset-top)] shrink-0">
        <div className="h-11 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={16} />
            <span className="font-serif text-[14px] text-ink tracking-tight">Attestr</span>
          </Link>
          <AuthButton />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-5 pb-2"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* iOS-style bottom tab bar */}
      <nav className="shrink-0 bg-surface/95 backdrop-blur-2xl border-t border-rule">
        <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-0.5 py-2 px-4 min-w-[60px] transition-colors ${
                  isActive ? 'text-accent' : 'text-ink-faint active:text-ink-tertiary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute -top-px left-3 right-3 h-0.5 bg-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <t.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2 : 1.5} />
                  <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{t.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
