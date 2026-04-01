import { useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navSpring = useSpring({
    background: scrolled ? 'rgba(17, 17, 22, 0.85)' : 'rgba(17, 17, 22, 0)',
    boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : '0 0px 0px rgba(0, 0, 0, 0)',
    backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
    borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0)',
  });

  return (
    <animated.nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        ...navSpring,
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Setorial Logo" width="36" height="36" />
          <span style={{ fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>Setorial</span>
        </div>
        
        <div className="nav-links">
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>How It Works</a>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Features</a>
          <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>FAQ</a>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="#download" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '1rem', borderRadius: '8px' }}>Get the App</a>
        </div>
      </div>
    </animated.nav>
  );
}
