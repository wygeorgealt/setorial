import { animated } from '@react-spring/web';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { BookMarked, BrainCircuit, CreditCard, Trophy, Zap, Clock } from 'lucide-react';

const featuresList = [
  {
    icon: <BookMarked color="var(--primary)" size={28} />,
    title: 'Curriculum-aligned lessons',
    description: 'Study materials built around WAEC, JAMB, and NECO syllabi. No fluff — just what you need to pass.',
  },
  {
    icon: <BrainCircuit color="var(--primary)" size={28} />,
    title: 'Practice with Mock Exams',
    description: 'Timed mock exams that simulate the actual exam experience. Pass standardize assessments to verify your progress.',
  },
  {
    icon: <CreditCard color="var(--primary)" size={28} />,
    title: 'Automated Monthly Payouts',
    description: 'No manual withdrawal buttons. Eligible students receive their payouts automatically on the 28th of every month.',
  },
  {
    icon: <Trophy color="var(--primary)" size={28} />,
    title: 'Climb the Leaderboard',
    description: 'See how you stack up against students across Nigeria. The top performers secure their place for rewards.',
  },
  {
    icon: <Zap color="var(--primary)" size={28} />,
    title: 'Unlock Power-Ups',
    description: 'Use your points to unlock power-ups that help you learn faster or protect your hard-earned streak.',
  },
  {
    icon: <Clock color="var(--primary)" size={28} />,
    title: 'Long-term Consistency',
    description: 'Monetization unlocks for premium students who maintain a strong streak over 12 months. Put in the work, reap the rewards.',
  },
];

export function Features() {
  const { ref: titleRef, springs: titleSpring } = useScrollAnimation();

  return (
    <section id="features" style={{ padding: '120px 0' }}>
      <div className="container">
        <animated.div ref={titleRef} style={titleSpring}>
          <h2 className="section-title">Everything You Need to Succeed</h2>
          <p className="section-subtitle">Study smarter, not just harder. We give you the tools and the motivation.</p>
        </animated.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '64px' }}>
          {featuresList.map((f, i) => {
            const { ref, springs } = useScrollAnimation({ delay: 100 * (i % 3) });
            return (
              <animated.div ref={ref} key={i} className="glass-card" style={{ ...springs, padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'white' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.description}</p>
              </animated.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
