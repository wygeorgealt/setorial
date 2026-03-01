# SETORIAL — Product Requirements Document
**Version 1.0 — MVP Phase**
*© Copyright Reserved — SETORIAL Product Development Team*

---

## Table of Contents

1. [Insight](#1-insight)
2. [Product Description](#2-product-description)
   - [2.1 WH Table](#21-wh-table)
   - [2.2 Product Goals](#22-product-goals)
   - [2.3 Target Audience](#23-target-audience)
   - [2.4 Revenue Model](#24-revenue-model)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [User Flow](#5-user-flow)
6. [Insights & Analytics](#6-insights--analytics)
   - [6.1 Product Development Life Cycle](#61-product-development-life-cycle)
   - [6.2 Deliverables](#62-deliverables)
   - [6.3 Version Control](#63-version-control)
7. [Financial Safety & Reward Control Framework](#7-financial-safety--reward-control-framework)
   - [7.1 Monthly Reward Pool Cap](#71-monthly-reward-pool-cap)
   - [7.2 Revenue Allocation Model](#72-revenue-allocation-model)
   - [7.3 Internal Conversion Logic](#73-internal-conversion-logic)
   - [7.4 Proportional Distribution Mechanism](#74-proportional-distribution-mechanism)
   - [7.5 Monetization Eligibility Controls](#75-monetization-eligibility-controls)
   - [7.6 Scheduled Automated Payout System](#76-scheduled-automated-payout-system)
   - [7.7 Financial Risk Monitoring Dashboard](#77-financial-risk-monitoring-dashboard)
   - [7.8 Sustainability Thresholds](#78-sustainability-thresholds)
8. [Legal & Transparency Positioning](#8-legal--transparency-positioning)

---

## 1. Insight

This document is designed for **founders, developers, designers, engineers, and product managers** working on the SETORIAL platform.

SETORIAL is a **gamified, scalable learning ecosystem** built to motivate consistent academic performance while rewarding long-term engagement.

Unlike traditional tutorial apps, SETORIAL integrates:

- Structured exam preparation
- Gamified learning mechanics
- Points-based earning system
- Controlled monthly automated payouts
- Tier-based monetization eligibility

This PRD defines:

- What must be built
- How monetization works
- How scheduled payouts are processed
- How the system scales to 30,000+ users
- How revenue and reward sustainability is maintained

---

## 2. Product Description

SETORIAL is a **mobile-first, gamified educational platform** built for Android and iOS. It prepares students for JAMB, WAEC, NECO, and other exams while introducing a long-term engagement and monetization model inspired by YouTube's scheduled payout system.

Students earn points through learning activities. Eligible premium students can convert those points into cash. Payouts are processed automatically on a **fixed monthly date (28th of every month)**.

The system is designed to support:

- 30,000+ concurrent users
- 100,000+ total users in the database
- Global participation (NGN & USD support)

---

### 2.1 WH Table

| Question | Answer |
|---|---|
| **What problem are we solving?** | Student inconsistency in exam preparation; lack of motivation for long-term study; no reward structure for disciplined learners; burnout in manual tutorial systems; unscalable WhatsApp-based academic operations |
| **Who experiences it?** | Secondary school students, JAMB candidates, WAEC/NECO candidates, undergraduates, long-term exam repeaters, online learners seeking structured systems |
| **What do we do to solve it?** | Gamified lessons & quizzes; points, streaks & leaderboard system; tier-based access (Free, Bronze, Silver, Gold); monetization eligibility for consistent premium users; scheduled automated monthly payout system; scalable mobile app (Android & iOS) |
| **Why our solution is better?** | SETORIAL merges academic structure, game psychology, financial reward discipline, controlled monetization mechanics, and scheduled payout automation. It is not just a tutorial app — it is a **habit-forming academic ecosystem** |

---

### 2.2 Product Goals

- Build a scalable app supporting 30,000+ concurrent users
- Increase student retention beyond 12 months
- Convert free users into paid tiers
- Reward only consistent & verified premium students
- Automate payout process (no manual withdrawal friction)
- Maintain financial sustainability of the reward system
- Deploy on Android & iOS simultaneously

---

### 2.3 Target Audience

| Audience Type | Segments |
|---|---|
| **Primary** | JAMB students, WAEC candidates, exam preparation learners |
| **Secondary** | Tutors, academic content creators |
| **Future** | Institutional partnerships, sponsored competitions |

---

### 2.4 Revenue Model

**Core Revenue**
- Subscription tiers (Bronze, Silver, Gold)

**Additional Revenue**
- Microtransactions (boosts, streak protection)
- Pay-per-mock access
- Sponsored competitions
- Partner-funded reward pools

> ⚠️ **Important Financial Rule:** Rewards paid to students must never exceed a predefined **20% of monthly platform revenue**. This ensures sustainability.

---

## 3. Functional Requirements

### User Management
- Signup (email/phone login)
- Tier management
- Profile verification (KYC for monetization)

### Gamification Engine
- Points tracking
- Streak tracking
- Badge system
- Leaderboards (subject & global)

### Learning System
- Subject → Topic → Lesson → Quiz → Timed Mock Exam
- Auto-grading system

### Wallet System
- Total points balance
- Eligible points balance
- Payout history

### Monetization Logic

```
1. Points earned (stored)
2. System checks eligibility
   - Silver/Gold tier
   - Minimum threshold met
   - Standardized exam passed
3. Eligible points move to monetizable balance
4. On 28th of each month:
   - System converts eligible balance
   - Automatic payout triggered
   - Wallet reset for paid amount
```

> ⚠️ Users **cannot** request payouts manually.

### Payment Methods

During verification, the user provides one of:
- **NGN:** Nigerian Bank Account
- **USD:** PayPal / Stripe

### Admin System
- View total liability (platform's current payout obligations)
- Approve flagged accounts
- Freeze suspicious wallets
- View payout batch reports
- Fraud detection flags

---

## 4. Non-Functional Requirements

### Performance

| Metric | Target |
|---|---|
| App load time | < 3 seconds |
| Leaderboard refresh | < 2 seconds |
| Quiz submission response | < 1 second |

### Scalability
- 30,000+ concurrent users
- Cloud auto-scaling
- Load balancing
- Caching for leaderboard & quizzes

### Security
- SSL encryption
- Encrypted wallet ledger
- KYC before monetization access
- Anti-cheat exam logic

### Availability
- 99.9% uptime SLA
- Automated backups

### Compatibility
- Android
- iOS

---

## 5. User Flow

```
Register
  └─► Select Tier
        └─► Study & Earn Points
              └─► Maintain Streak
                    └─► After 12 Months: Eligibility Check
                          └─► Monetizable Balance Activated
                                └─► System displays next payout date (28th)
                                      └─► On 28th: Automatic Payout Triggered
                                            └─► Transaction Logged
                                                  └─► Student Notified
                                                        └─► Cycle Continues
```

---

## 6. Insights & Analytics

### KPIs

| KPI | Target |
|---|---|
| User registration time | < 1 minute |
| Quiz submission | < 1 second |
| Leaderboard update | < 2 seconds |
| Monthly payout batch completion | < 10 minutes |
| Wallet accuracy | 100% |

**Financial KPI:** Reward pool must remain within the approved monthly percentage of revenue at all times.

---

### 6.1 Product Development Life Cycle

| Phase | Duration |
|---|---|
| Planning | 2 weeks |
| UI/UX Design | 1 week |
| MVP Development | 4 weeks |
| QA & Load Testing | 3 weeks |
| Soft Launch | 2 weeks |
| Scale Optimization | Continuous |

---

### 6.2 Deliverables

- Android App
- iOS App
- Admin Dashboard
- Wallet & Ledger System
- Scheduled Payout Automation Engine
- Points & Gamification Engine
- Payment Integration (Subscription + Payout)
- Load Testing Report (30,000-user simulation)

---

### 6.3 Version Control

| Field | Value |
|---|---|
| Document Name | SETORIAL PRD |
| Version | 1.0 |
| Effective Date | TBD |

---

## 7. Financial Safety & Reward Control Framework

This framework ensures the long-term financial sustainability of SETORIAL while maintaining fairness, transparency, and scalability. The reward system must motivate learning without exposing the company to uncontrolled financial liability.

---

### 7.1 Monthly Reward Pool Cap

SETORIAL shall allocate a **maximum of 20% of Gross Monthly Revenue** to the student reward pool during early-stage operations (Year 1).

This percentage may be reviewed in later years based on revenue stability and growth metrics. **Under no circumstance shall total student payouts exceed the defined monthly reward pool cap.**

---

### 7.2 Revenue Allocation Model

**Example — Gross Monthly Revenue: ₦1,000,000**

| Allocation | Percentage | Amount |
|---|---|---|
| Student Reward Pool | 20% | ₦200,000 |
| Operations, Marketing, Growth, Infrastructure & Reserve | 80% | ₦800,000 |

This ensures: business continuity, platform scaling, server maintenance, and emergency liquidity buffer.

---

### 7.3 Internal Conversion Logic

> 🔒 **Confidential Backend Mechanism**

The conversion of points to cash is determined **exclusively by backend logic**.

**What users see:**
- Points earned
- Monetizable balance (once eligible)

**What users do NOT see:**
- Fixed points-to-cash ratio
- Conversion formula
- Reward pool percentage
- Internal liability calculations

**Why this is hidden:** To prevent manipulation attempts, misinterpretation of dynamic adjustments, false accusations of inconsistency, and reverse engineering of the reward system.

The conversion rate dynamically adjusts based on:
- Total monthly revenue
- Total eligible monetizable balance
- Monthly reward pool size
- Active monetized user count

---

### 7.4 Proportional Distribution Mechanism

If total monetizable balance across all users **exceeds** the monthly reward pool, the system applies a proportional payout formula.

**Example:**

| Parameter | Value |
|---|---|
| Total Eligible Balance | ₦500,000 |
| Reward Pool | ₦200,000 |
| Distribution Ratio | 200,000 ÷ 500,000 = **40%** |

Each monetized user receives **40% of their eligible balance** for that month. The remaining balance automatically **rolls over** to the next payout cycle.

This mechanism prevents sudden liquidity shock, business insolvency, and over-disbursement.

---

### 7.5 Monetization Eligibility Controls

To protect reward integrity:

- Only **Silver and Gold** tier users may qualify
- Minimum **12 months** of consistent activity required
- Mandatory **standardized assessment** verification
- Users inactive for **30+ consecutive days** are automatically demonetized
- Demonetized users must **restart the qualification cycle**

---

### 7.6 Scheduled Automated Payout System

SETORIAL adopts a **fixed payout model** similar to major content platforms.

**Payout Date:** 28th of every month *(configurable by admin)*

**Key Rules:**
- No manual withdrawal requests
- All eligible balances are processed automatically
- Payments sent to verified accounts only
- Currency determined during verification (NGN or USD)
- Exchange rate logged at time of payout for global transactions

> Users are notified in advance: *"Next payout scheduled for the 28th."*

---

### 7.7 Financial Risk Monitoring Dashboard

*(Admin Only)*

The system must provide real-time visibility of:

- Total monetizable liability
- Current month revenue
- Reward pool size
- Liability-to-revenue ratio
- Projected payout exposure
- Fraud flags

**If exposure exceeds safe threshold:**
- Backend conversion rate adjusts automatically
- Admin receives a risk alert notification

---

### 7.8 Sustainability Thresholds

| Period | Max Reward Allocation |
|---|---|
| Year 1 | 20% of monthly revenue |
| Year 2 (Conditional) | Up to 25% (subject to profitability) |
| Hard Cap | 30% — requires formal board-level review |

---

## 8. Legal & Transparency Positioning

### SETORIAL Terms & Conditions — Rewards, Points & Monetization Policy

#### 1. Nature of Points
- Points are digital engagement indicators — they measure participation, performance, and consistency within the platform.
- Points have **no direct cash value** unless the user qualifies under the monetization eligibility policy.
- Points are **not** a currency, salary, wage, investment return, or guaranteed financial entitlement.
- SETORIAL reserves the right to modify how points are calculated, accumulated, or displayed at any time.

#### 2. Monetization Eligibility
- Monetization is **not automatic** and is subject to qualification requirements determined solely by SETORIAL.
- Eligibility requirements include (but are not limited to): minimum period of consistent activity, minimum performance thresholds, subscription tier requirements, KYC identity verification, and completion of standardized assessments.
- Inactivity for **30 consecutive days** may result in automatic suspension or removal of monetization status.
- SETORIAL reserves the right to revoke monetization eligibility in cases of suspected abuse, fraud, or policy violations.

#### 3. Reward Pool & Sustainability Policy
- All payouts are subject to SETORIAL's **Monthly Reward Pool Allocation**.
- Total payout in any given month shall not exceed a predefined percentage of gross revenue.
- If total eligible balances exceed the reward pool, payouts shall be **distributed proportionally**.
- Any unpaid eligible balance may roll over to subsequent payout cycles at SETORIAL's discretion.
- Users acknowledge that payout amounts **may vary month to month**.

#### 4. Conversion of Points
- The methodology used to convert points into monetary rewards is **proprietary and confidential**.
- SETORIAL does **not** guarantee a fixed point-to-cash conversion rate.
- Conversion mechanics are determined solely by the platform's backend systems.

#### 5. Scheduled Payout System
- SETORIAL operates a **fixed scheduled payout model**.
- Users **cannot** manually request withdrawals outside the scheduled payout cycle.
- Payments will only be made to verified payout accounts submitted during monetization verification.
- SETORIAL is not responsible for delays caused by third-party payment processors or banking institutions.

#### 6. Currency & Exchange Rates
- Payout currency is determined based on the verified payout account provided by the user.
- For international payouts, **exchange rates applicable at the time of transaction** shall apply.
- SETORIAL is not liable for fluctuations in currency value or exchange rate differences.

#### 7. Anti-Fraud & Abuse Policy
Any attempts to manipulate quizzes, streak systems, automated systems, or referral mechanics may result in:
- Immediate suspension
- Loss of all accumulated points
- Permanent platform ban
- Forfeiture of eligible balances

SETORIAL reserves full discretion in investigating and determining violations.

---

## Color Scheme

| Tier | Colors |
|---|---|
| Free | Purple + Green |
| Bronze | Purple + Bronze |
| Silver | Purple + Silver |
| Gold | Purple + Gold |

---

## Conclusion

SETORIAL is a scalable gamified education ecosystem designed for **long-term engagement and controlled monetization**.

It supports:
- 30,000+ users
- Structured learning pathways
- Sustainable reward payouts
- Automated monthly payment system
- Android & iOS deployment

> This platform must be engineered for **scale, financial control, and long-term growth** — not short-term hype.

---

*© Copyright Reserved — SETORIAL Product Development Team*