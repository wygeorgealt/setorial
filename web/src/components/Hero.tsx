import { useSpring, animated } from '@react-spring/web';
import { HeroScene } from './HeroScene';

export function Hero() {
  const headlineSpring = useSpring({
    from: { opacity: 0, transform: 'translate3d(0, 40px, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0px, 0)' },
    delay: 200,
  });

  const subSpring = useSpring({
    from: { opacity: 0, transform: 'translate3d(0, 30px, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0px, 0)' },
    delay: 400,
  });

  const btnSpring = useSpring({
    from: { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0px, 0)' },
    delay: 600,
  });

  return (
    <section>
      <HeroScene />
      <div className="container" style={{ position: 'relative', zIndex: 1, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '800px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <animated.div style={headlineSpring}>
            <h1 className="text-gradient" style={{ fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px' }}>
              Get Paid to <span className="text-gradient-primary">Study.</span>
            </h1>
          </animated.div>
          
          <animated.div style={subSpring}>
            <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '650px', lineHeight: 1.6 }}>
              Setorial is the gamified learning ecosystem that rewards Nigerian students for <strong style={{color: 'white'}}>long-term consistency</strong>. Ace your JAMB, WAEC, or NECO, maintain your streak, and unlock <strong style={{color: 'var(--accent)'}}>automated monthly payouts</strong> straight to your bank account.
            </p>
          </animated.div>

          <animated.div style={{ ...btnSpring, display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#download" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" alt="Apple" width="20" style={{marginRight: '8px'}}/>
              App Store
            </a>
            <a href="#download" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" alt="Play Store" width="20" style={{marginRight: '8px'}}/>
              Google Play
            </a>
          </animated.div>
          
          <animated.div style={{ ...btnSpring, marginTop: '48px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', padding: '4px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
              </span>
              Trusted by hundreds of students across Nigeria 🇳🇬
            </p>
          </animated.div>
        </div>
      </div>
    </section>
  );
}
