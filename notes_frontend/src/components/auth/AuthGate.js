import React, { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabaseClient';
import { reportError } from '../../utils/errors';

/**
 * PUBLIC_INTERFACE
 */
export default function AuthGate({ enabled, children, onUserChange }) {
  /** Minimal auth gate using Supabase magic link if enabled; otherwise pass-through */
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [sent, setSent] = useState(false);
  const supabase = getSupabase();

  useEffect(() => {
    if (!enabled || !supabase) return;
    let mounted = true;
    supabase.auth.getSession()
      .then(({ data }) => {
        if (!mounted) return;
        const u = data?.session?.user || null;
        setUser(u);
        onUserChange?.(u);
      })
      .catch(reportError);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      onUserChange?.(u);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [enabled, supabase, onUserChange]);

  if (!enabled) return children;

  if (!supabase) {
    return (
      <div className="auth-card">
        <h2>Authentication unavailable</h2>
        <p>Supabase is not configured.</p>
      </div>
    );
  }

  if (user) return children;

  const sendLink = async (e) => {
    e.preventDefault();
    try {
      const siteUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: siteUrl,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      reportError(err);
      alert('Failed to send magic link');
    }
  };

  return (
    <div className="auth-card">
      <h2>Sign in</h2>
      <p>We’ll email you a magic link for instant sign-in.</p>
      <form onSubmit={sendLink} className="auth-form">
        <input
          type="email"
          required
          placeholder="you@example.com"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn primary" type="submit">Send magic link</button>
      </form>
      {sent && <p className="muted">Check your email for the sign-in link.</p>}
    </div>
  );
}
