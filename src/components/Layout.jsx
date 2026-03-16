import { NavLink, Outlet, Link } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { Menu, X } from 'lucide-react';
import AuthButton from './AuthButton';
import Logo from './Logo';
import ErrorBoundary from './ErrorBoundary';

const GridBackground = lazy(() => import('./GridBackground'));

export default function Layout() {
  const [mobileNav, setMobileNav] = useState(false);

  const link = ({ isActive }) =>
    `text-[13px] tracking-wide transition-colors px-3 py-1.5 ${
      isActive ? 'text-ink font-medium' : 'text-ink-tertiary hover:text-ink-secondary'
    }`;

  const mobileLink = ({ isActive }) =>
    `block text-[15px] tracking-wide transition-colors px-4 py-3 border-b border-rule-light ${
      isActive ? 'text-ink font-medium bg-surface-raised' : 'text-ink-tertiary hover:text-ink-secondary'
    }`;

  return (
    <div className="min-h-screen bg-void relative">
      <ErrorBoundary>
        <Suspense fallback={null}>
          <GridBackground />
        </Suspense>
      </ErrorBoundary>
      <header className="sticky top-0 z-50 bg-void/80 backdrop-blur-2xl border-b border-rule">
        <div className="max-w-[1080px] mx-auto px-4 md:px-6 flex items-center justify-between h-[52px]">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={22} />
            <span className="font-serif text-[17px] text-ink tracking-tight">Attestr</span>
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/register" className={link}>Register</NavLink>
            <NavLink to="/verify" className={link}>Verify</NavLink>
            <NavLink to="/explorer" className={link}>My Media</NavLink>
            <NavLink to="/activity" className={link}>Activity</NavLink>
            <NavLink to="/docs" className={link}>API</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <AuthButton />
            </div>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="md:hidden p-1.5 text-ink-tertiary hover:text-ink transition"
              aria-label="Toggle menu"
            >
              {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile nav dropdown */}
        {mobileNav && (
          <nav className="md:hidden border-t border-rule bg-void/95 backdrop-blur-2xl">
            <NavLink to="/register" className={mobileLink} onClick={() => setMobileNav(false)}>Register</NavLink>
            <NavLink to="/verify" className={mobileLink} onClick={() => setMobileNav(false)}>Verify</NavLink>
            <NavLink to="/explorer" className={mobileLink} onClick={() => setMobileNav(false)}>My Media</NavLink>
            <NavLink to="/activity" className={mobileLink} onClick={() => setMobileNav(false)}>Activity</NavLink>
            <div className="px-4 py-3">
              <AuthButton />
            </div>
          </nav>
        )}
      </header>
      <main className="relative z-10 max-w-[1080px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
