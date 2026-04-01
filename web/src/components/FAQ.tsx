import { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Is Setorial free to use?',
    answer: 'Yes! Setorial has a Free tier where you can access lessons and mock exams. However, to qualify for monetization and payouts, you must be a premium student (Silver or Gold tier).'
  },
  {
    question: 'How do I get paid?',
    answer: 'There are no manual withdrawals. Once you hit your 12-month consistency requirement and pass your standardized assessment, your eligible balance is automatically paid directly to your bank account on the 28th of every month.'
  },
  {
    question: 'What is the "12-month consistency requirement"?',
    answer: 'Setorial rewards long-term discipline, not short-term gaming. You must maintain your active learning streak for 12 months. If you go inactive for 30 consecutive days, your monetization eligibility resets.'
  },
  {
    question: 'Which exams does Setorial cover?',
    answer: 'We currently structure our curriculum around WAEC, JAMB, and NECO syllabi, making it perfect for SS1-SS3 students and university applicants.'
  },
  {
    question: 'What happens to my points if I don\'t qualify yet?',
    answer: 'Your points securely roll over month to month. Your eligible balance is safe until you meet the requirements and the next 28th-of-the-month payout triggers.'
  }
];

function FAQItem({ faq, isOpen, onClick }: { faq: any, isOpen: boolean, onClick: () => void }) {
  const contentSpring = useSpring({
    height: isOpen ? 'auto' : 0,
    opacity: isOpen ? 1 : 0,
    overflow: 'hidden',
  });

  const iconSpring = useSpring({
    transform: `rotate(${isOpen ? 180 : 0}deg)`,
  });

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-surface)' }} onClick={onClick}>
      <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 600, margin: 0 }}>{faq.question}</h4>
        <animated.div style={iconSpring}>
          <ChevronDown color="var(--primary)" />
        </animated.div>
      </div>
      <animated.div style={contentSpring}>
        <div style={{ padding: '0 32px 24px 32px', color: 'var(--text-secondary)' }}>
          {faq.answer}
        </div>
      </animated.div>
    </div>
  );
}

export function FAQ() {
  const { ref: titleRef, springs: titleSpring } = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" style={{ padding: '120px 0', background: 'var(--bg-surface-elevated)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <animated.div ref={titleRef} style={titleSpring}>
          <h2 className="section-title">Common Questions</h2>
          <p className="section-subtitle">Everything you need to know about learning and earning with Setorial.</p>
        </animated.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '64px' }}>
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
