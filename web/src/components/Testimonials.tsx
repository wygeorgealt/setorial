import { animated } from '@react-spring/web';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const testimonials = [
  {
    quote: "I stayed consistent for a whole year preparing for JAMB. Waking up on the 28th to see my first auto-payout alert was surreal.",
    name: "Tomiwa A.",
    title: "SS3 Student, Lagos"
  },
  {
    quote: "Other apps just want you to memorize. Setorial actually builds your discipline. The monthly reward is just the icing on the cake.",
    name: "Emeka O.",
    title: "University Applicant, Enugu"
  },
  {
    quote: "My parents didn't believe the 'auto-payout' thing until the 28th arrived. Now they remind me to keep my streak alive!",
    name: "Fatima B.",
    title: "SS2 Student, Abuja"
  }
];

export function Testimonials() {
  const { ref: titleRef, springs: titleSpring } = useScrollAnimation();

  return (
    <section style={{ background: 'var(--bg-surface)' }}>
      <div className="container">
        <animated.div ref={titleRef} style={titleSpring}>
          <h2 className="section-title">Trusted by Students</h2>
          <p className="section-subtitle">Don't just take our word for it.</p>
        </animated.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '64px' }}>
          {testimonials.map((t, i) => {
            const { ref, springs } = useScrollAnimation({ delay: 150 * i, distance: 40 });
            return (
              <animated.div ref={ref} style={{ ...springs, padding: '40px 32px', position: 'relative' }} key={i} className="glass-card">
                <div style={{ position: 'absolute', top: -15, left: 32, fontSize: '4rem', color: 'var(--primary-glow)', lineHeight: 1, fontFamily: 'serif' }}>"</div>
                <p style={{ fontSize: '1.1rem', color: 'white', marginBottom: '24px', position: 'relative', zIndex: 1, fontStyle: 'italic' }}>
                  {t.quote}
                </p>
                <div>
                  <h4 style={{ color: 'var(--primary)', fontWeight: 600 }}>{t.name}</h4>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.title}</span>
                </div>
              </animated.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
