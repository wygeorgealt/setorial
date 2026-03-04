*7.0 PRICING ARCHITECTURE & GEO-LOCATION STRATEGY*

*7.1 Overview*

SETORIAL will implement a dynamic, region-based subscription pricing system.

Subscription prices shall vary based on the user’s billing country and currency.

Pricing logic must be controlled via the backend and adjustable from the Admin Dashboard without requiring app updates.

*7.2 Tier Structure*

The platform will have four tiers:

• Free
• Bronze
• Silver
• Gold

Monetization eligibility applies only to Silver and Gold tiers.

*7.3 Base Pricing Reference Model*

Pricing will be defined per country group.

*Primary Market (Nigeria)*

Bronze: ₦3,500/month
Silver: ₦7,500/month
Gold: ₦15,000/month

Currency: NGN

*Tier 1 International Markets (e.g., USA, UK, Canada, Australia)*

Bronze: $12/month
Silver: $25/month
Gold: $45/month

Currency: USD (or localized currency equivalent)

*Tier 2 Markets (e.g., India, Philippines, South Africa, Ghana)*

Pricing adjusted to local purchasing power.

Example reference (subject to admin control):

Bronze: $6–$8 equivalent
Silver: $12–$15 equivalent
Gold: $25–$30 equivalent

Final prices configurable via admin panel.

*7.4 Country Detection Logic*

The system shall determine pricing using:

Primary Method: • App Store / Google Play billing country

Secondary Validation: • Payment processor billing address

Additional Support: • IP-based country detection (non-authoritative)

If discrepancies occur between IP and billing country:

→ Billing country overrides IP.

Users may not manually change pricing region.

*7.5 Currency Handling Rules*

• Each country group has fixed base pricing in local currency. • Currency conversion is NOT done live from NGN. • Each country has independent pricing entries stored in database.

Example Database Model:

Country_Code | Tier | Monthly_Price | Currency NG | Silver | 7500 | NGN US | Silver | 25 | USD IN | Silver | 14 | USD equivalent

This prevents real-time FX instability issues.

*7.6 Admin Pricing Control*

Admin dashboard must allow:

• Add new country pricing • Edit tier prices per country • Activate promo discounts • Enable annual plans • Temporarily override pricing

Changes should reflect instantly without requiring mobile app update.

*7.7 Annual Subscription Logic*

Each tier must support:

• Monthly subscription • Annual subscription (with discount)

Discount standard: 2 months free equivalent (approx. 15–20%)

Example: Silver Nigeria: ₦7,500/month Annual = ₦75,000

The annual price must also be configurable per country.

*7.8 VPN & Abuse Protection*

To prevent pricing abuse:

• Subscription purchase must use app store billing country. • Currency must match billing country. • Account flagged if repeated region switching attempts occur. • Monetization eligibility locked to original verified country.

*7.9 Monetization Eligibility Protection via Pricing*

Since monetization is tied to Silver & Gold tiers:

• Pricing must discourage mass low-quality subscriptions. • Eligibility review remains performance-based. • Subscription alone does not guarantee monetization.

*7.10 Revenue & Reward Pool Integration*

Monthly Gross Revenue = Sum of all subscription payments globally.

Reward Pool = 20% of global gross revenue.

Payout distribution logic applies irrespective of country.

Currency Handling:

• Nigerian users paid in NGN. • International users paid in USD. • Exchange rate locked at payout date. • Exchange rate logged in payout ledger.

*7.11 Technical Implementation Summary (For Developer)*

Developer must implement:

1. Country-based pricing table in backend.
2. Billing-country detection logic.
3. Admin pricing control interface.
4. Tier-based subscription control.
5. Annual & monthly plan support.
6. Revenue aggregation logic.
7. Reward pool calculation engine (20% cap).
7. Currency-based payout routing.
8. Audit logging for financial transparency.
9. Fraud & region manipulation detection.
*8.0 GLOBAL DYNAMIC PRICING ENGINE (PPP-BASED MODEL)*

*8.1 Objective*

SETORIAL will implement a Purchasing Power Parity (PPP)-adjusted global pricing system.

The goal is to:

• Maximize global accessibility
• Increase conversion rates in lower-income regions
• Maintain premium positioning in high-income regions
• Optimize global revenue without underpricing

*8.2 Core Pricing Philosophy*

Instead of manually setting every country price arbitrarily, SETORIAL will:

1. Define a Base Anchor Price (USD-based).
2. Adjust country-level pricing using an Economic Adjustment Multiplier.
3. Allow manual override via Admin Dashboard.

*8.3 Base Anchor Price (Global Reference)*

All pricing tiers will be anchored to USD base values.

Example Base Anchor:

Bronze — $12
Silver — $25
Gold — $45

These represent Tier 1 (High-income economy) pricing.

All other countries will be calculated relative to this anchor.

*8.4 Country Classification Model*

Countries will be grouped using World Bank income classifications:

• Tier A — High Income
• Tier B — Upper Middle Income
• Tier C — Lower Middle Income
• Tier D — Low Income

Each tier will have a multiplier applied to the base price.

*8.5 Economic Adjustment Multipliers (Example)*

Tier A (High Income) Multiplier: 1.0
Example: USA, UK, Canada
Silver = $25

Tier B (Upper Middle Income) Multiplier: 0.75
Silver = $18–$20 equivalent

Tier C (Lower Middle Income) Multiplier: 0.50
Silver = $12–$15 equivalent

Tier D (Low Income) Multiplier: 0.35–0.40
Silver = $8–$10 equivalent

Nigeria would likely fall into Tier C pricing bracket.

*8.6 Calculation Logic (Backend)*

Final_Price = Base_Price × Country_Multiplier

Then converted into local currency using:

• Fixed exchange rate buffer (monthly updated) OR • Payment processor exchange rate at billing time

Important:

Prices should NOT fluctuate daily.

Exchange rate adjustments should be:

• Locked monthly
• Updated via admin

*8.7 Developer Implementation Requirements*

The pricing engine must:

1. Store Base Prices in USD.
2. Store Country Multiplier per country.
3. Detect user billing country via:
* App Store country
* Google Play billing region
4. Calculate localized display price.
5. Round prices psychologically (e.g., ₦7,500 not ₦7,643).
6. Cache pricing to prevent recalculation overload.

Admin Dashboard must allow:

• Edit multipliers • Override individual country pricing • Freeze specific country pricing • Run temporary promotions per region

*8.8 Anti-Arbitrage Protection*

To prevent users from exploiting cheaper regions:

• Billing country must match payment method. • Monetization payout currency tied to verified country. • Country locked after monetization approval. • Frequent region switching flags account.

*8.9 Strategic Revenue Advantage*

Why this model is powerful:

• US user pays $25
• Nigerian user pays equivalent of $12–$15
• India maybe $10–$12
• UK stays near $25

You maximize:

• Volume in lower economies
• Margin in higher economies

This increases total global revenue pool.

Since Reward Pool = 20% of global gross revenue,

Higher-income country subscriptions directly increase payout sustainability.

*8.10 Financial Stability Safeguard*

Even with PPP pricing:

Reward Pool remains:

Maximum 20% of total global gross revenue.

This ensures:

• Low-income region growth does not overload reward liability. • High-income region margin stabilizes system. • Conversion rate remains backend-controlled and confidential.

*Strategic Note for Developer*

The pricing engine must be modular and scalable.

Future Phase Possibilities:

• AI-based elasticity testing
• A/B testing country pricing
• Country-specific promotional campaigns
• Dynamic discounting during exam seasons
*9.0 GEO-ADJUSTED REWARD & PAYOUT MODEL*

*9.1 Objective*

SETORIAL will implement a country-adjusted payout structure aligned with:

• Regional purchasing power
• Subscription pricing tiers
• Revenue contribution per region
• Global sustainability controls

The goal is to:

• Maintain fairness within each region
• Protect global reward pool stability
• Prevent cross-country earning imbalance

*9.2 Core Philosophy*

Subscription pricing varies by country.

Therefore:

Reward payouts must also vary proportionally by country group.

Users compete and earn within their economic region, not globally across unequal economies.

*9.3 Regional Reward Pool Segmentation*

Instead of one single global reward pool, the system will maintain:

Regional Reward Pools.

Example:

Total Global Revenue = ₦20,000,000
Breakdown: Nigeria Revenue = ₦10,000,000
USA Revenue = ₦6,000,000
India Revenue = ₦4,000,000

Reward Cap = 20% per region.

Nigeria Reward Pool = ₦2,000,000
USA Reward Pool = ₦1,200,000
India Reward Pool = ₦800,000

This prevents:
• Nigerian revenue subsidizing US payouts
• US users dominating lower-income regions
• Cross-region imbalance

*9.4 Country-Based Earning Logic*

Each user belongs to a locked billing country once monetized.

Payout eligibility and reward calculations apply only within that country’s reward pool.

Meaning:

• Nigerian users compete within Nigeria pool
• US users compete within US pool
• India users compete within India pool
No cross-border payout mixing.

*9.5 Conversion Logic Per Region*

Each region has:

• Independent conversion rate
• Independent proportional distribution
• Independent liability tracking

Example:

Nigeria: Eligible Balance = ₦5,000,000
Pool = ₦2,000,000
Distribution Ratio = 40%

USA: Eligible Balance = $10,000
Pool = $1,200,000 equivalent
Distribution Ratio calculated separately

*9.6 Currency Handling*

Each region payout must be:

• Paid in local primary currency (if supported) OR • Paid in USD equivalent

Exchange rate must be:

• Logged at payout time • Stored in payout ledger • Transparent in transaction history

*9.7 Country Lock & Abuse Protection*

Once a user:

• Qualifies for monetization • Completes KYC • Links payout account

Their country is locked.

Switching country requires:
• Full re-verification • Monetization reset • Admin approval

This prevents:

• Signing up in low-price country
• Earning in high-value payout region

*9.8 Fairness Communication Strategy*

Public communication must frame it as:

“Regional reward pools ensure fairness based on local participation and revenue.”

Never frame it as:
“Different countries earn different money.”

Messaging matters.

*9.9 Technical Implementation Requirements*

Developer must implement:

1. Region-based revenue tracking.
2. Separate reward pool calculation per region.
3. Separate liability tracking per region.
4. Region-based payout batch processing.
5. Locked monetization country flag.
6. Admin region override control.
7. Automated proportional distribution per region.

*9.10 Strategic Advantage of This Model*

This structure ensures:

• Nigeria growth does not destabilize US pool
• High-income users increase premium revenue
• Lower-income regions remain accessible
• Global expansion remains sustainable
• Investors see controlled risk exposure
*10.0 STRICT REGION-BASED REWARD ALLOCATION MODEL*

*10.1 Policy Overview*

SETORIAL shall operate a strictly segmented regional reward allocation system.

Each country (or approved regional group) shall:

• Generate its own revenue pool
• Maintain its own reward allocation
• Process payouts independently
• Operate without cross-region financial support

There shall be no cross-subsidization between regions.

*10.2 Regional Revenue Isolation*

For every billing country:

Monthly Gross Revenue (Country X)
= Sum of all subscriptions billed under that country.

Example:

Nigeria Revenue = ₦10,000,000
USA Revenue = $20,000
India Revenue = $8,000

Each country is treated as a financially independent unit.

*10.3 Strict 20% Reward Cap Per Region*

Reward Pool Per Country
= 20% × That Country’s Gross Monthly Revenue

Example:

Nigeria: Revenue = ₦10,000,000
Reward Pool = ₦2,000,000

USA: Revenue = $20,000
Reward Pool = $4,000

India: Revenue = $8,000
Reward Pool = $1,600

This cap cannot be exceeded under any circumstance.

*10.4 No Cross-Region Subsidization Rule*

Revenue generated in one country:

• Cannot fund payouts in another country. • Cannot be used to offset reward deficit elsewhere. • Remains financially isolated.

This prevents:

• Economic imbalance • Regional exploitation • Artificial inflation of payout expectations

*10.5 Regional Monetization & Competition Logic*

Users compete only within their verified billing country.

Meaning:

• Nigerian users compete against Nigerian users. • US users compete against US users. • Indian users compete against Indian users.

Leaderboards, eligibility metrics, and payout distribution operate regionally once monetization is activated.

*10.6 Proportional Distribution Within Region*

If total eligible balances exceed that region’s reward pool:

The system applies proportional payout logic strictly within that region.

Example:

Nigeria: Eligible Balance = ₦5,000,000
Pool = ₦2,000,000

Distribution Ratio = 40%

Each Nigerian monetized user receives 40% of their eligible balance.

Unpaid balance rolls over.
This logic does not interact with other regions.

*10.7 Country Lock Mechanism*

Once a user:

• Completes monetization verification • Links payout account • Confirms billing country

Their country becomes locked.

Changing country requires:
• Monetization reset • Full KYC re-verification • Admin approval

This prevents geographic arbitrage.

*10.8 Backend System Requirements*

Developer must implement:

1. Revenue tracking per billing country.
2. Independent reward pool calculation per country.
3. Independent liability tracking per country.
4. Separate payout batch processing per country.
5. Country-lock flag on monetized accounts.
6. Admin dashboard displaying:
* Revenue per region
* Reward pool per region
* Liability ratio per region
* Exposure alerts per region

*10.9 Financial Safety Outcome*

This strict model ensures:

• One region’s growth cannot bankrupt another. • High-income regions remain premium. • Lower-income regions remain accessible. • Global expansion remains mathematically controlled. • Reward expectations remain economically realistic