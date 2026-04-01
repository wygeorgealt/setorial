import { animated } from '@react-spring/web';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function Footer() {
  const { ref: ctaRef, springs: ctaSpring } = useScrollAnimation({ distance: 100 });

  return (
    <footer style={{ background: 'var(--bg-dark)', paddingTop: '120px', borderTop: '1px solid var(--border-light)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Footer CTA */}
        <animated.div ref={ctaRef} style={{ ...ctaSpring, textAlign: 'center', marginBottom: '120px' }}>
          <h2 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
            Your phone is already <br />
            in your hand.
          </h2>
          <p className="text-gradient-primary" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px' }}>
            Make it work for you.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '40px' }}>
            Download Setorial today and start turning study time into income.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '16px 32px' }}>Download App</button>
          </div>
        </animated.div>

        {/* Links Bottom */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '40px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '32px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Setorial Logo" width="32" height="32" />
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Setorial</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
            <a href="mailto:setorialapp@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>IG</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>X</a>
          </div>

        </div>

        <div style={{ textAlign: 'center', paddingBottom: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} Setorial. Built for Nigerian students. 🇳🇬
        </div>
      </div>
    </footer>
  );
}
