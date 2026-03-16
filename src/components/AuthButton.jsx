import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signInWithGoogle, signOut } from '../lib/firebase';
import { useAuth } from './AuthProvider';

export default function AuthButton() {
  const user = useAuth();
  const [loading, setLoading] = useState(false);

  if (user === undefined) return <div className="w-16" />;

  if (!user) {
    return (
      <button
        onClick={async () => { setLoading(true); try { await signInWithGoogle(); } catch {} setLoading(false); }}
        disabled={loading}
        className="text-[13px] text-ink-tertiary hover:text-ink transition disabled:opacity-50"
      >
        {loading ? '...' : 'Sign in'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full ring-1 ring-rule" referrerPolicy="no-referrer" />
      <span className="text-[12px] text-ink-secondary max-w-[90px] truncate">{user.displayName?.split(' ')[0]}</span>
      <button onClick={async () => { try { await signOut(); } catch {} }} className="text-ink-faint hover:text-danger transition p-0.5">
        <LogOut className="w-3 h-3" />
      </button>
    </div>
  );
}
