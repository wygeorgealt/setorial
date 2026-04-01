import { animated } from '@react-spring/web';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { BookOpen, TrendingUp, Wallet } from 'lucide-react';

export function HowItWorks() {
  const { ref: ref1, springs: spring1 } = useScrollAnimation({ delay: 100 });
  const { ref: ref2, springs: spring2 } = useScrollAnimation({ delay: 300 });
  const { ref: ref3, springs: spring3 } = useScrollAnimation({ delay: 500 });
  const { ref: titleRef, springs: titleSpring } = useScrollAnimation();

  return (
    <section id="how-it-works" style={{ background: 'var(--bg-surface)' }}>
      <div className="container">
        <animated.div ref={titleRef} style={titleSpring}>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to start earning while you learn.</p>
        </animated.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '64px' }}>
          
          {/* Step 1 */}
          <animated.div ref={ref1} className="glass-card" style={{ ...spring1, padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid var(--primary)' }}>
              <BookOpen size={32} color="white" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'white' }}>1. Learn</h3>
            <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontWeight: 600 }}>Study your subjects</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Pick from a growing library of WAEC, JAMB, and NECO topics. Complete bite-sized lessons at your own pace and build real knowledge.</p>
          </animated.div>

          {/* Step 2 */}
          <animated.div ref={ref2} className="glass-card" style={{ ...spring2, padding: '40px 32px', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid var(--accent)' }}>
              <TrendingUp size={32} color="white" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'white' }}>2. Build Consistency</h3>
            <h4 style={{ color: 'var(--accent)', marginBottom: '12px', fontWeight: 600 }}>Streaks and Points</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Log in daily, complete tasks, and maintain your learning streak. It takes focus and long-term consistency to unlock your monetization eligibility.</p>
          </animated.div>

          {/* Step 3 */}
          <animated.div ref={ref3} className="glass-card" style={{ ...spring3, padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid var(--success)' }}>
              <Wallet size={32} color="white" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'white' }}>3. Auto-Payouts</h3>
            <h4 style={{ color: 'var(--success)', marginBottom: '12px', fontWeight: 600 }}>The 28th of every month</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Once you qualify, your eligible balance is automatically disbursed directly to your bank account on the 28th. No manual withdrawal buttons needed.</p>
          </animated.div>

        </div>
      </div>
    </section>
  );
}
