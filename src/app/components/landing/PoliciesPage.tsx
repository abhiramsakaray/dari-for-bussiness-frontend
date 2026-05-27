import { useState, useEffect } from 'react';
import { SEO } from '../../../components/SEO';
import { LandingLayout } from './LandingLayout';
import { Link } from 'react-router-dom';

const POLICIES = {
  terms: {
    label: "Terms & Conditions",
    icon: "ti-file-description",
    effective: "May 27, 2026",
    sections: [
      { id: "intro", title: "1. Introduction & Acceptance" },
      { id: "definitions", title: "2. Definitions" },
      { id: "nature", title: "3. Nature of Services" },
      { id: "eligibility", title: "4. Eligibility" },
      { id: "kyc", title: "5. Merchant Registration & KYC" },
      { id: "payee", title: "6. Payee Terms" },
      { id: "merchant", title: "7. Merchant Obligations" },
      { id: "fees", title: "8. Fees & Charges" },
      { id: "prohibited", title: "9. Prohibited Activities" },
      { id: "ip", title: "10. Intellectual Property" },
      { id: "disclaimers", title: "11. Disclaimers" },
      { id: "liability", title: "12. Limitation of Liability" },
      { id: "indemnification", title: "13. Indemnification" },
      { id: "suspension", title: "14. Suspension & Termination" },
      { id: "governing", title: "15. Governing Law & Disputes" },
      { id: "amendments", title: "16. Amendments" },
      { id: "misc", title: "17. Miscellaneous" },
    ],
    content: [
      {
        id: "intro",
        title: "1. Introduction & Acceptance of Terms",
        body: `These Terms and Conditions ("Terms", "Agreement") govern your access to and use of the services provided by Dari Payments ("Dari Payments", "we", "us", or "our"), operated by Dari Organization, through its websites daripay.xyz, api.daripay.xyz, pay.daripay.xyz, daripay.in, api.daripay.in, and pay.daripay.in (collectively, the "Platform").

By accessing or using our Platform, registering as a Merchant, or processing any payment through our infrastructure, you agree to be legally bound by these Terms. If you do not agree to these Terms, you must immediately discontinue all use of the Platform.`,
        notice: `IMPORTANT NOTICE: Dari Payments is a technology infrastructure provider — not a regulated payment gateway, bank, financial institution, or money service business. We provide software tools that facilitate stablecoin payment collection. We do not hold a payment aggregator licence, payment gateway licence, or any equivalent regulatory authorisation from the Reserve Bank of India ("RBI") or any other financial regulator. Use of this Platform does not constitute a banking or financial services relationship.`,
      },
      {
        id: "definitions",
        title: "2. Definitions",
        body: `For the purposes of these Terms, the following definitions apply:`,
        definitions: [
          { term: "Platform", def: 'The payment infrastructure software and services operated by Dari Organization through the domains daripay.xyz, api.daripay.xyz, pay.daripay.xyz, daripay.in, api.daripay.in, and pay.daripay.in.' },
          { term: "Merchant", def: 'Any individual (18 years or older), freelancer, or business entity that registers on the Platform to accept stablecoin payments from customers.' },
          { term: "Payee / Customer", def: "Any individual who makes a payment to a Merchant through the Platform's checkout interface (pay.daripay.xyz or pay.daripay.in)." },
          { term: "Stablecoins", def: "The digital tokens supported on the Platform, including USDC (USD Coin), USDT (Tether), EURC (Euro Coin), AUDD (Australian Dollar Digital by Novatti), and PYUSD (PayPal USD), as updated from time to time." },
          { term: "Supported Networks", def: "Ethereum, Tron, Solana, Polygon, BNB Smart Chain (BSC), Stellar, Base, Avalanche, and Arbitrum, as updated from time to time." },
          { term: "Custodial Wallet", def: "The Dari Payments-managed digital wallet in which Merchant funds are temporarily held pending withdrawal or refund processing." },
          { term: "Dashboard", def: "The Merchant-facing web portal accessible through the Platform for account management, transaction tracking, and withdrawal management." },
          { term: "API", def: "The application programming interface provided by Dari Payments, accessible via api.daripay.xyz and api.daripay.in, for programmatic integration." },
          { term: "KYC", def: "Know Your Customer — the identity verification procedures required under these Terms and applicable law." },
          { term: "AML", def: "Anti-Money Laundering procedures implemented in accordance with the AML Policy." },
          { term: "Withdrawal", def: "The transfer of stablecoin funds from a Merchant's Custodial Wallet to a designated external wallet address." },
          { term: "Services", def: "All features, tools, APIs, dashboards, checkout pages, and infrastructure provided by Dari Payments." },
        ],
      },
      {
        id: "nature",
        title: "3. Nature of Services",
        body: `3.1  Technology Infrastructure Only. Dari Payments provides technology infrastructure that enables Merchants to accept stablecoin payments. We are not a payment aggregator, payment service provider, bank, financial institution, money transmitter, cryptocurrency exchange, or Virtual Asset Service Provider (VASP) regulated under applicable law.

3.2  Custodial Function. While Dari Payments temporarily holds funds in Custodial Wallets for operational purposes — including facilitating refunds and withdrawal processing — this does not constitute us as a regulated custodian, trustee, or financial intermediary under any applicable law.

3.3  No Fiat Services. Dari Payments does not provide fiat currency on-ramp or off-ramp services. All transactions are settled exclusively in Supported Stablecoins.

3.4  Blockchain Dependency. The Platform relies on public blockchain networks. Dari Payments has no control over blockchain network performance, transaction finality, network fees (gas fees), blockchain congestion, smart contract behaviour, or protocol changes including "forks". We are not responsible for any delay, failure, or loss caused by blockchain network conditions.

3.5  Stablecoin Disclaimer. Dari Payments does not issue, manage, or back any stablecoin. The stability, peg maintenance, redemption value, and regulatory status of any stablecoin is entirely outside our control. Dari Payments makes no warranty regarding the future value or regulatory treatment of any stablecoin.

3.6  Indian Operations. Dari Payments operates from India. The daripay.in domain and associated subdomains are available exclusively for Merchants operating in India. Use of the .xyz domain is for global Merchants. Indian Merchants are additionally subject to applicable Indian laws including the Foreign Exchange Management Act, 1999 and the Prevention of Money Laundering Act, 2002.`,
      },
      {
        id: "eligibility",
        title: "4. Eligibility",
        body: `4.1  Age Requirement. You must be at least 18 years of age to register as a Merchant or use any part of the Platform.

4.2  Legal Capacity. By registering, you represent that you have the full legal capacity to enter into binding contracts under the laws of your jurisdiction.

4.3  Individuals and Businesses. Both individuals (including freelancers) and registered business entities may register as Merchants, subject to KYC requirements applicable to each category.

4.4  Geographic Availability. The Platform is available globally. However, use of the Platform from jurisdictions where stablecoin transactions are prohibited, restricted, or require specific licensing is entirely at the user's own legal risk. Dari Payments does not represent that the Services are legal, compliant, or appropriate in any specific jurisdiction, and it is your responsibility to obtain independent legal advice if required.

4.5  Restricted Persons. The following persons or entities are strictly prohibited from using the Platform:
  •  Individuals or entities subject to sanctions by OFAC (USA), UN Security Council, European Union, or equivalent governmental authority.
  •  Entities incorporated in or controlled from comprehensively sanctioned jurisdictions including Iran, North Korea, Syria, Cuba, and the Crimea region.
  •  Individuals who have previously been suspended or banned from the Platform.`,
      },
      {
        id: "kyc",
        title: "5. Merchant Account Registration & KYC",
        body: `5.1  Registration. To access Merchant Services, you must create an account by providing accurate, complete, and current information including:
  •  Full Legal Name (individual or authorised representative)
  •  Valid Email Address
  •  Mobile Number
  •  Full Residential or Business Address
  •  Country of Residence or Incorporation

5.2  KYC Verification. All Merchants are required to complete Know Your Customer (KYC) verification before accessing transaction limits above the free-tier threshold. Transaction limits and plan-based caps are detailed in your Dashboard.

5.3  Accuracy of Information. You warrant that all information submitted during registration and KYC is true, accurate, current, and complete. You are responsible for keeping this information up to date. Providing false, misleading, or incomplete information is a material breach of these Terms and may result in immediate account termination and reporting to relevant authorities.

5.4  KYC Updates. You are obligated to notify Dari Payments and update your KYC information promptly whenever there is a material change, including change of address, business structure, ownership, or beneficial control.

5.5  Right to Decline or Revoke. Dari Payments reserves the right to decline any KYC application, request additional supporting documentation, or revoke previously approved KYC status at its sole discretion, including based on risk scoring, regulatory obligations, or changes in applicable law.

5.6  Account Security. You are solely responsible for maintaining the confidentiality and security of your account credentials, API keys, and Dashboard access. Dari Payments will not be liable for any loss arising from unauthorised access to your account resulting from your failure to secure your credentials. You must immediately notify us of any suspected unauthorised access at abhiram@dariorganization.com.

5.7  Single Account. Each Merchant may maintain only one account per legal entity or individual identity. Creating multiple accounts to circumvent transaction limits or KYC requirements is prohibited.`,
      },
      {
        id: "payee",
        title: "6. Payee Terms",
        body: `6.1  Payee Data Collection. When a Payee completes a payment through a Merchant's checkout page hosted on the Platform (pay.daripay.xyz or pay.daripay.in), Dari Payments collects the following information for transaction processing and compliance purposes:
  •  Full Name
  •  Email Address
  •  Mobile Number
  •  Country

6.2  Consent. By completing a payment through the Platform, Payees acknowledge and consent to the collection and processing of their personal data as described in our Privacy Policy.

6.3  Payee Responsibility. Payees are solely responsible for ensuring the accuracy of the wallet address from which they send payment. Blockchain transactions are irreversible once confirmed on-chain. Dari Payments is not liable for funds sent to an incorrect address.

6.4  No Direct Commercial Relationship. Dari Payments is a technology intermediary. The commercial, contractual, and legal relationship in respect of the underlying goods or services is solely between the Payee and the Merchant. Dari Payments is not a party to that relationship and has no liability for the Merchant's products, services, delivery, or performance.

6.5  Transaction Irreversibility. Payees acknowledge that stablecoin transactions broadcast to a public blockchain network are generally irreversible. Dari Payments does not guarantee the ability to reverse or cancel any confirmed transaction.

6.6  Refund Requests. Payees may request a refund by contacting the Merchant directly within 7 days of the transaction date. Refund decisions are made solely at the Merchant's discretion. Dari Payments does not adjudicate refund disputes between Merchants and Payees. If a Merchant approves a refund and sufficient funds are available in the Custodial Wallet, the refund will be processed as a new stablecoin transfer to the same originating wallet address, and both parties will be notified.`,
      },
      {
        id: "merchant",
        title: "7. Merchant Obligations",
        body: `7.1  Lawful Use. Merchants must use the Platform solely for lawful purposes, in strict compliance with all applicable laws, regulations, and these Terms.

7.2  Transparency to Customers. Merchants must clearly and prominently disclose to their customers that payments are processed in stablecoins via Dari Payments infrastructure, and that transactions are irreversible by nature.

7.3  Refund and Returns Policy. Merchants are solely responsible for setting, publishing, and honouring their own refund, return, and cancellation policies to their customers. Dari Payments provides refund tooling but does not dictate or enforce Merchant refund terms.

7.4  Regulatory Compliance. Merchants are solely responsible for their own compliance with applicable tax, GST, customs, business registration, and sector-specific regulatory requirements in their jurisdiction. Dari Payments does not provide legal, tax, or compliance advice.

7.5  Prohibited Activities. Merchants must not use the Platform for any activity listed in Section 9 (Prohibited Activities).

7.6  API Integrity. Merchants using the API must comply with Dari Payments' API documentation, rate limits, and acceptable use guidelines. Reverse engineering, tampering with, or exceeding API rate limits is strictly prohibited.

7.7  No Sub-licensing. Merchants may not sub-license, resell, or otherwise make the Platform available to third parties as if it were their own product without Dari Payments' prior written consent.`,
      },
      {
        id: "fees",
        title: "8. Fees & Charges",
        body: `8.1  Withdrawal Fee. A fee of 3% (three percent) is charged on the value of all withdrawals from the Custodial Wallet to an external wallet address.

8.2  Plan Fees. Plan subscription fees, API access fees, and any other service charges are as displayed in the Merchant Dashboard and may vary by plan tier.

8.3  Network Fees. Blockchain network fees (gas fees) are charged separately from and in addition to Platform fees. Network fees are determined by the respective blockchain and are borne by the Merchant. The estimated network fee will be displayed at the time of withdrawal.

8.4  Fee Changes. Dari Payments reserves the right to modify its fee structure at any time. Merchants will be provided a minimum of 30 days' prior notice of any material fee changes via email or Dashboard notification.

8.5  Non-Refundable Fees. Fees paid to Dari Payments are non-refundable once a transaction or withdrawal has been processed, unless otherwise expressly required by applicable law.

8.6  Taxes. All fees are exclusive of applicable taxes. You are responsible for determining and paying any taxes applicable to your use of the Platform, including GST, VAT, or equivalent.`,
      },
      {
        id: "prohibited",
        title: "9. Prohibited Activities",
        body: `Merchants and users are strictly prohibited from using the Platform for any of the following:

9.1  Illegal Activities — Any activity that violates applicable laws or regulations, including but not limited to fraud, identity theft, money laundering, tax evasion, or financing of terrorism.

9.2  Gambling and Betting — Operating online gambling, sports betting, lottery, fantasy sports with real-money prizes, or games of chance, unless duly licensed by a competent authority.

9.3  Adult Content — Pornographic, obscene, sexually explicit, or adult entertainment platforms or services.

9.4  Controlled Substances — Sale of illegal drugs, narcotics, psychotropic substances, unprescribed pharmaceuticals, or any controlled substance.

9.5  Weapons and Ammunition — Sale of firearms, ammunition, explosives, military-grade equipment, or any weapon without valid government licensing.

9.6  Dark Web and Anonymous Markets — Any marketplace or service operating on Tor, I2P, or similar anonymous networks, or markets primarily serving illicit trade.

9.7  Fraudulent Investment Schemes — Ponzi schemes, pyramid schemes, unregistered securities offerings, unlicensed forex or crypto investment pools, or any scheme promising guaranteed returns.

9.8  Counterfeit and Piracy — Sale of counterfeit goods, pirated software, bootleg media, or any content infringing third-party intellectual property rights.

9.9  Sanctioned Entities — Transacting with, accepting payments from, or making payments to individuals or entities on OFAC, UN, EU, or equivalent sanctions lists.

9.10  Hate and Violence — Content promoting violence, terrorism, extremism, hate speech, racial or religious discrimination, or harassment of any individual or group.

9.11  Unauthorized Data Harvesting — Scraping, harvesting, or unauthorised collection of third-party personal data through or in connection with the Platform.

9.12  Platform Abuse — Interfering with, attempting to hack, overloading, or disrupting the Platform, its APIs, servers, or infrastructure.

9.13  Misrepresentation — Creating false Merchant accounts, impersonating other persons or entities, or misrepresenting business activities during KYC or account management.

9.14  Structuring — Breaking transactions into smaller amounts to evade monitoring thresholds or KYC requirements ("structuring" or "smurfing").

Violation of this Section entitles Dari Payments to immediately suspend or terminate your account without notice, forfeit held funds subject to regulatory requirements, and report the activity to relevant law enforcement and financial intelligence authorities.`,
      },
      {
        id: "ip",
        title: "10. Intellectual Property",
        body: `10.1  Ownership. All intellectual property rights in the Platform and its components — including software, source code, APIs, trademarks, logos, trade names ("Dari Payments", "DariPay"), documentation, user interfaces, and content — are owned by or exclusively licensed to Dari Organization.

10.2  Limited Licence. Dari Payments grants Merchants a limited, non-exclusive, non-transferable, revocable, royalty-free licence to use the Platform solely for its intended commercial purpose in accordance with these Terms during the term of your account.

10.3  Restrictions. You may not, without prior written consent: copy, modify, adapt, translate, distribute, sell, sublicense, reverse-engineer, decompile, or create derivative works of any part of the Platform; use Dari Payments trademarks or branding in a misleading manner; or remove any copyright or proprietary notices.

10.4  Feedback. Any feedback, suggestions, or feature requests you submit to Dari Payments may be used by us freely without any obligation to you.`,
      },
      {
        id: "disclaimers",
        title: "11. Disclaimers",
        body: `11.1  As-Is Basis. The Platform is provided on an "as-is" and "as-available" basis. Dari Payments makes no representations or warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, data accuracy, or uninterrupted or error-free operation.

11.2  No Transaction Guarantee. Dari Payments does not guarantee that any transaction will be completed, confirmed, or finalized. Blockchain network issues, smart contract anomalies, wallet incompatibilities, or third-party service failures may result in failed or delayed transactions for which Dari Payments bears no liability.

11.3  No Stablecoin Warranty. Dari Payments does not issue, manage, back, or insure any stablecoin. The stability, availability, peg maintenance, and regulatory status of any stablecoin is entirely beyond our control. We do not guarantee that any stablecoin will maintain its pegged value.

11.4  Downtime. The Platform may experience scheduled or unscheduled downtime for maintenance, upgrades, or unforeseen technical incidents. Dari Payments will endeavour to provide advance notice of scheduled maintenance but is not liable for losses arising from any downtime.

11.5  Third-Party Services. The Platform may integrate with or contain links to third-party services, wallets, or blockchain explorers. Dari Payments is not responsible for the availability, accuracy, security, or legality of such third-party services.

11.6  Regulatory Risk. The regulatory treatment of stablecoins, digital assets, and payment infrastructure is evolving. Changes in applicable law may affect the availability or functionality of the Platform. Dari Payments is not liable for any loss resulting from regulatory changes.`,
      },
      {
        id: "liability",
        title: "12. Limitation of Liability",
        body: `12.1  Liability Cap. To the maximum extent permitted by applicable law, Dari Payments' total aggregate liability to any Merchant arising out of or in connection with these Terms or the Services — whether in contract, tort (including negligence), breach of statutory duty, or otherwise — shall not exceed the total fees paid by that Merchant to Dari Payments in the three (3) calendar months immediately preceding the event giving rise to the claim.

12.2  Excluded Losses. In no event shall Dari Payments be liable for any of the following, whether foreseeable or not:
  •  Loss of profits or revenue
  •  Loss of business or contracts
  •  Loss of data or information
  •  Loss of anticipated savings
  •  Business interruption
  •  Indirect, incidental, special, consequential, exemplary, or punitive damages

12.3  Statutory Exceptions. Nothing in these Terms limits or excludes liability for: (a) death or personal injury caused by negligence; (b) fraud or fraudulent misrepresentation; or (c) any other liability that cannot be lawfully excluded under applicable Indian law.

12.4  Payee Disclaimer. Dari Payments is not liable to any Payee for failed transactions, Merchant disputes, non-delivery of goods or services, or any commercial issue between Payees and Merchants.

12.5  Force Majeure. Dari Payments shall not be liable for failure or delay in performance due to circumstances beyond reasonable control, including blockchain network failures, natural disasters, government actions, pandemics, power failures, or internet infrastructure disruptions.`,
      },
      {
        id: "indemnification",
        title: "13. Indemnification",
        body: `You agree to fully indemnify, defend, and hold harmless Dari Payments, Dari Organization, and their respective officers, directors, employees, agents, and successors from and against any and all claims, demands, damages, losses, liabilities, costs, and expenses (including reasonable legal and professional fees) arising from or related to:

  (a)  Your use of the Platform in breach of these Terms or applicable law;
  (b)  Your violation of any applicable law, regulation, or third-party right;
  (c)  Any claim by a Payee, customer, or third party arising from your Merchant activities, products, services, or representations;
  (d)  Any false, inaccurate, or misleading information submitted by you during registration, KYC, or any subsequent communication;
  (e)  Your failure to obtain appropriate licences or regulatory approvals required in your jurisdiction.

This indemnification obligation survives termination of your account and these Terms.`,
      },
      {
        id: "suspension",
        title: "14. Account Suspension & Termination",
        body: `14.1  Voluntary Termination. Merchants may close their account at any time by submitting a request through the Dashboard or by contacting abhiram@dariorganization.com. Prior to closure, all pending withdrawals must be completed or cancelled.

14.2  Immediate Suspension — Fraud. Dari Payments may immediately and without prior notice suspend an account upon: detection of fraudulent activity; AML violations; match against sanctions lists; suspected terrorism financing; or material breach of these Terms where immediate action is required to prevent harm.

14.3  30-Day Notice — Other Violations. For non-fraud violations or policy breaches, Dari Payments will provide 30 days' written notice before suspension. During this period, the Merchant may respond to the notice and remedy the violation. If the violation is remedied to Dari Payments' reasonable satisfaction, suspension may be averted.

14.4  Funds on Suspension. Upon account suspension, the Merchant's Custodial Wallet will be temporarily frozen pending investigation and appeals. A formal notice will be issued to the Merchant's registered email address. Funds will be released upon successful appeal, account reinstatement, or regulatory clearance. If directed by a competent judicial or regulatory authority, funds may be forfeited or transferred as instructed.

14.5  Post-Termination Data. Dari Payments will retain your personal data and transaction records for a minimum of 5 years as required by the Prevention of Money Laundering Act, 2002 and applicable Indian law, notwithstanding your account closure.`,
      },
      {
        id: "governing",
        title: "15. Governing Law & Dispute Resolution",
        body: `15.1  Governing Law. These Terms shall be governed by, and construed in accordance with, the laws of India, without regard to its conflict of law principles.

15.2  Amicable Resolution. In the event of any dispute, controversy, or claim arising out of or in connection with these Terms or the Services, the parties shall first attempt to resolve the matter through good-faith negotiations within 30 days of a written notice of dispute from either party.

15.3  Arbitration. If the dispute cannot be resolved amicably within 30 days (or such extended period as agreed in writing), it shall be finally resolved by binding arbitration under the Arbitration and Conciliation Act, 1996 (India) (as amended). The arbitration shall be conducted by a sole arbitrator mutually agreed upon by the parties. In the absence of agreement within 15 days, the arbitrator shall be appointed by the courts. The seat and venue of arbitration shall be Hyderabad, Telangana, India. The language of the proceedings shall be English. The arbitral award shall be final and binding.

15.4  Injunctive Relief. Notwithstanding the arbitration clause, either party may seek urgent injunctive, interim, or emergency relief from courts of competent jurisdiction in Hyderabad, India, pending constitution of the arbitral tribunal.

15.5  Class Action Waiver. You irrevocably waive any right to bring or participate in class action, collective, or representative proceedings against Dari Payments in any forum.`,
      },
      {
        id: "amendments",
        title: "16. Amendments",
        body: `Dari Payments reserves the right to modify these Terms at any time. Material amendments will be communicated to Merchants via email (to the registered address) and/or Dashboard notification at least 14 days before the amended Terms take effect. Non-material amendments (such as corrections of typographical errors or reorganisation of content) may take effect immediately. Your continued use of the Platform after the effective date of revised Terms constitutes your acceptance of those changes. If you do not agree to the revised Terms, you must cease using the Platform and close your account prior to the effective date.`,
      },
      {
        id: "misc",
        title: "17. Miscellaneous",
        body: `17.1  Entire Agreement. These Terms, together with the Privacy Policy, AML Policy, and Withdrawal Policy, constitute the entire agreement between you and Dari Payments with respect to the subject matter hereof and supersede all prior agreements, representations, and understandings.

17.2  Severability. If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court or arbitral tribunal of competent jurisdiction, that provision shall be severed. The remaining provisions shall continue in full force and effect.

17.3  No Waiver. Failure by Dari Payments to enforce any provision of these Terms on any occasion shall not constitute a waiver of our right to enforce that provision in the future.

17.4  Assignment. You may not assign, transfer, or sub-contract your rights or obligations under these Terms to any third party without Dari Payments' prior written consent. Dari Payments may assign these Terms and its rights and obligations in connection with a merger, acquisition, corporate restructuring, or sale of assets.

17.5  Relationship of Parties. Nothing in these Terms creates a partnership, joint venture, agency, franchise, or employment relationship between you and Dari Payments.

17.6  Language. These Terms are drafted in English. In the event of any translation, the English version shall prevail.

17.7  Contact. For any queries regarding these Terms, contact: Abhiram, Dari Organization — abhiram@dariorganization.com`,
      },
    ],
  },

  privacy: {
    label: "Privacy Policy",
    icon: "ti-lock",
    effective: "May 27, 2026",
    sections: [
      { id: "p-intro", title: "1. Introduction" },
      { id: "p-collect", title: "2. Data We Collect" },
      { id: "p-use", title: "3. How We Use Your Data" },
      { id: "p-legal", title: "4. Legal Basis for Processing" },
      { id: "p-sharing", title: "5. Data Sharing & Third Parties" },
      { id: "p-retention", title: "6. Data Retention" },
      { id: "p-rights", title: "7. Your Rights" },
      { id: "p-cookies", title: "8. Cookies" },
      { id: "p-security", title: "9. Data Security" },
      { id: "p-transfer", title: "10. International Transfers" },
      { id: "p-children", title: "11. Children's Privacy" },
      { id: "p-grievance", title: "12. Grievance Officer" },
      { id: "p-changes", title: "13. Policy Changes" },
    ],
    content: [
      {
        id: "p-intro",
        title: "1. Introduction",
        body: `Dari Payments ("we", "us", "our"), operated by Dari Organization, is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, share, and safeguard personal data when you use our Platform across daripay.xyz, api.daripay.xyz, pay.daripay.xyz, daripay.in, api.daripay.in, and pay.daripay.in.

This Policy applies to:
  •  Merchants who register and use the Platform
  •  Payees (end customers) who complete payments through Merchant checkout pages
  •  Visitors to our websites

This Policy is designed to comply with:
  •  The Digital Personal Data Protection Act, 2023 ("DPDP Act") — India
  •  The General Data Protection Regulation (EU) 2016/679 ("GDPR") — to the extent applicable to EU users
  •  The Information Technology Act, 2000 and IT (Amendment) Act, 2008 — India

By using the Platform, you acknowledge that you have read and understood this Privacy Policy.`,
      },
      {
        id: "p-collect",
        title: "2. Data We Collect",
        body: `2.1  Merchant Data (collected during registration and KYC):
  •  Full Legal Name
  •  Email Address
  •  Mobile Number
  •  Full Residential or Business Address
  •  Country of Residence or Incorporation
  •  Transaction history and Platform usage data
  •  API usage logs and integration metadata
  •  Device identifiers, IP address, and browser information

2.2  Payee Data (collected at checkout):
  •  Full Name
  •  Email Address
  •  Mobile Number
  •  Country
  •  Blockchain wallet address (public address only)
  •  Transaction details: amount, stablecoin type, network, timestamp, transaction hash

2.3  Automatically Collected Data (all users):
  •  IP addresses and approximate geolocation (country/city level)
  •  Browser type, version, and language settings
  •  Device type, operating system, and identifiers
  •  Website pages visited, time spent, click patterns (via Google Analytics)
  •  Referring URLs and session data
  •  Cookies and local storage identifiers (see Section 8)

2.4  Communications Data:
Any information you provide when contacting us via email, support channels, or feedback forms.

2.5  Data We Do NOT Collect:
  •  We do not collect government-issued ID numbers (Aadhaar, PAN, Passport) unless specifically required for enhanced KYC.
  •  We do not collect payment card numbers, bank account details, or fiat payment information.
  •  We do not collect biometric data or conduct facial recognition.`,
      },
      {
        id: "p-use",
        title: "3. How We Use Your Data",
        body: `3.1  To Provide Services:
  •  Processing and verifying Merchant registrations and KYC
  •  Facilitating stablecoin payment transactions through the checkout interface
  •  Maintaining and operating Custodial Wallets
  •  Processing withdrawal requests (manual and auto-withdrawal)
  •  Sending transactional and operational communications:
      – Payment confirmation notifications
      – Withdrawal status updates
      – KYC approval or rejection notifications
      – Security alerts and account notices

3.2  Compliance and Legal Obligations:
  •  Conducting KYC and AML checks in accordance with applicable law
  •  Risk scoring and fraud prevention
  •  Maintaining records as required under the Prevention of Money Laundering Act, 2002 and DPDP Act
  •  Responding to valid legal orders, regulatory requests, or court directions

3.3  Security and Integrity:
  •  Detecting, investigating, and preventing fraudulent, unauthorised, or illegal activity
  •  Monitoring platform integrity, API abuse, and unauthorized access

3.4  Analytics and Product Improvement:
  •  Analysing aggregated and anonymised usage patterns through Google Analytics to improve our Services
  •  No personal data is used for targeted advertising, remarketing, or sale to third parties.

3.5  Marketing Communications:
  •  We do not send marketing emails, promotional SMS, push notifications, or newsletters without your explicit prior consent.
  •  All communications are strictly transactional and operational in nature.`,
      },
      {
        id: "p-legal",
        title: "4. Legal Basis for Processing",
        body: `4.1  Under GDPR (for EU users), we process your personal data on the following legal bases:
  •  Contractual Necessity (Art. 6(1)(b)): Processing required to perform the Services you have agreed to under the Terms and Conditions.
  •  Legal Obligation (Art. 6(1)(c)): Compliance with AML, KYC, data retention, and other applicable legal requirements.
  •  Legitimate Interests (Art. 6(1)(f)): Fraud prevention, platform security, service improvement, and dispute resolution, where such interests are not overridden by your fundamental rights.
  •  Consent (Art. 6(1)(a)): Where we rely on consent (e.g., cookies and analytics), you may withdraw consent at any time without affecting the lawfulness of prior processing.

4.2  Under the DPDP Act, 2023 (for Indian users), we process personal data on the basis of:
  •  Consent: Obtained through clear and informed acceptance of this Policy.
  •  Legitimate Use: Processing required for providing contracted Services, legal compliance, and legitimate business purposes as defined under the Act.

4.3  You may withdraw consent at any time by contacting abhiram@dariorganization.com. Withdrawal does not affect the lawfulness of processing prior to withdrawal.`,
      },
      {
        id: "p-sharing",
        title: "5. Data Sharing & Third Parties",
        body: `5.1  We do not sell, rent, or trade your personal data to any third party for their commercial purposes.

5.2  We may share your data with the following categories of recipients only to the extent necessary:
  •  Analytics Provider: Google Analytics (anonymised usage statistics only).
  •  Infrastructure Providers: India-based server and cloud hosting providers.
  •  Regulatory and Law Enforcement Authorities: FIU-India, Indian law enforcement agencies, courts, or other governmental bodies.
  •  Blockchain Networks: Transaction data submitted to public blockchain networks is inherently public and immutable.

5.3  In the event of a merger, acquisition, or sale of assets involving Dari Organization, your data may be transferred to the acquiring entity, subject to equivalent privacy protections.

5.4  All third-party data processors are engaged under contractual obligations requiring them to process data only on our documented instructions.`,
      },
      {
        id: "p-retention",
        title: "6. Data Retention",
        body: `6.1  We retain your personal data for a minimum of 5 (five) years following account closure or the last transaction, in compliance with the Prevention of Money Laundering Act, 2002 (PMLA) and regulatory requirements.

6.2  The 5-year minimum retention applies to KYC records, transaction history, AML investigation records, and account correspondence.

6.3  Analytics data collected through Google Analytics is retained in accordance with Google's standard data retention settings.

6.4  Even upon your request for account deletion, we will delete or anonymise data that is not subject to mandatory retention requirements.

6.5  On-Chain Data: Transaction data recorded on public blockchain networks cannot be deleted or modified.`,
      },
      {
        id: "p-rights",
        title: "7. Your Rights",
        body: `7.1  Under the DPDP Act, 2023 (India) and GDPR (EU), you have the following rights:
  •  Right to Access: Request a copy of your personal data.
  •  Right to Correction: Request correction of inaccurate data.
  •  Right to Erasure: Request deletion, subject to mandatory PMLA legal retention.
  •  Right to Restriction of Processing: Request restricted processing.
  •  Right to Data Portability: Receive data in structured, machine-readable format.
  •  Right to Object: Object to processing based on legitimate interests.
  •  Right to Withdraw Consent: Withdraw consent at any time.
  •  Right to Grievance Redressal: File a complaint with our Grievance Officer.
  •  Right to Nominate: Nominate another individual to exercise rights in event of incapacity or death.

7.2  Exercising Your Rights. To exercise rights, submit a written request to:
  Name: Abhiram | Designation: Grievance Officer
  Email: abhiram@dariorganization.com
  Response Time: Within 30 days of receipt.

7.3  Identity Verification. We may verify your identity before processing requests.

7.4  Blockchain Limitation. We cannot delete or modify data recorded on public blockchain networks.

7.5  EU Users: You may lodge a complaint with your local supervisory authority.`,
      },
      {
        id: "p-cookies",
        title: "8. Cookies",
        body: `8.1  We use cookies and similar tracking technologies on our websites. Below is a summary:
  Strictly Necessary Cookies: Required for core Platform functions. Authentications and sessions.
  Analytics Cookies: Used to understand how visitors interact (via Google Analytics). These are anonymised.

8.2  We do NOT use:
  •  Advertising or retargeting cookies
  •  Third-party tracking pixels (Meta Pixel, LinkedIn Insight, etc.)
  •  Session replay tools (Hotjar, FullStory, etc.)
  •  Cross-site tracking technologies

8.3  Cookie Consent. On your first visit, we request consent for analytics cookies. strictly necessary cookies do not require consent.

8.4  Managing Cookies. You can control cookie preferences through browser settings.`,
      },
      {
        id: "p-security",
        title: "9. Data Security",
        body: `9.1  We implement appropriate technical and organisational measures, including:
  •  Encryption in transit using TLS 1.2/1.3 (SSL/HTTPS)
  •  Encryption of sensitive data at rest
  •  Role-based access controls and principle of least privilege
  •  Physical and logical security controls on India-based servers

9.2  Data Breach. In event of a personal data breach posing significant risk:
  •  Notify authority within 72 hours (where required by GDPR)
  •  Notify affected individuals without undue delay

9.3  You are responsible for maintaining the security of credentials and API keys.`,
      },
      {
        id: "p-transfer",
        title: "10. International Data Transfers",
        body: `10.1  Primary Storage. Your personal data is primarily processed and stored on India-based servers.

10.2  Cross-Border Access. Transmissions and processing from outside India comply with applicable data protection laws.

10.3  EU Users. Standard Contractual Clauses (SCCs) are implemented where applicable.

10.4  Blockchain Data. Broadcast transaction data is distributed globally across network nodes.

10.5  Google Analytics. Anonymised usage data may be processed on servers outside India.`,
      },
      {
        id: "p-children",
        title: "11. Children's Privacy",
        body: `The Platform is not directed to or intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware we have collected minor's data, we will promptly delete it. Contact us immediately at abhiram@dariorganization.com if you suspect this.`,
      },
      {
        id: "p-grievance",
        title: "12. Grievance Officer (India)",
        body: `In accordance with the DPDP Act, 2023, and IT Rules, 2021, Dari Organization has designated:
  Name: Abhiram
  Organisation: Dari Organization (operating as Dari Payments)
  Email: abhiram@dariorganization.com
  Response Timeline: Acknowledgement in 48 hours; Resolution in 30 days

You may also file a complaint with the Data Protection Board of India once operationalised, or with your local GDPR authority.`,
      },
      {
        id: "p-changes",
        title: "13. Policy Changes",
        body: `We may update this Privacy Policy from time to time. Material changes will be notified via email and/or Platform notification at least 14 days before taking effect. Continued use of the Platform after the effective date constitutes your acceptance of the updated Policy.`,
      },
    ],
  },

  aml: {
    label: "AML Policy",
    icon: "ti-shield-check",
    effective: "May 27, 2026",
    sections: [
      { id: "a-purpose", title: "1. Purpose & Scope" },
      { id: "a-definitions", title: "2. Definitions" },
      { id: "a-cdd", title: "3. Customer Due Diligence" },
      { id: "a-edd", title: "4. Enhanced Due Diligence" },
      { id: "a-risk", title: "5. Risk Scoring Framework" },
      { id: "a-monitoring", title: "6. Transaction Monitoring" },
      { id: "a-sanctions", title: "7. Sanctions Screening" },
      { id: "a-str", title: "8. Suspicious Transaction Reporting" },
      { id: "a-records", title: "9. Record Keeping" },
      { id: "a-jurisdictions", title: "10. Prohibited Jurisdictions" },
      { id: "a-cooperation", title: "11. Cooperation with Authorities" },
      { id: "a-obligations", title: "12. Merchant AML Obligations" },
      { id: "a-amendments", title: "13. Amendments" },
    ],
    content: [
      {
        id: "a-purpose",
        title: "1. Purpose & Scope",
        body: `1.1  Dari Payments is committed to preventing the use of its Platform for money laundering, terrorism financing, sanctions evasion, or any other financial crime. This Anti-Money Laundering and Counter-Terrorism Financing Policy ("AML/CTF Policy" or "Policy") sets out the framework, procedures, and controls through which Dari Payments detects, prevents, and reports suspicious activity.

1.2  This Policy applies to all Merchants, Payees, and any individual or entity accessing or transacting through the Platform.

1.3  This Policy is designed in alignment with:
  •  Prevention of Money Laundering Act, 2002 (PMLA) — India
  •  PMLA (Maintenance of Records) Rules, 2005
  •  Financial Intelligence Unit – India (FIU-IND) Guidelines
  •  Financial Action Task Force (FATF) Recommendations on Virtual Assets and Virtual Asset Service Providers (VASPs)
  •  OFAC sanctions regulations (USA)
  •  UN Security Council Consolidated Sanctions List
  •  EU Consolidated Sanctions List

1.4  Dari Payments intends to register with FIU-IND as and when mandated by applicable law and regulatory notification, and is committed to full regulatory compliance upon such obligation arising. In the interim, Dari Payments applies industry best practices and will file individual suspicious transaction reports where required.`,
      },
      {
        id: "a-definitions",
        title: "2. Definitions",
        body: `  •  Money Laundering: The process of making proceeds derived from criminal activity appear legitimate, including placement, layering, and integration of illicit funds.
  •  Terrorism Financing (CTF): Providing or collecting funds, whether from legitimate or illegitimate sources, with the intent or knowledge that they are to be used, wholly or partly, to commit a terrorist act.
  •  Suspicious Transaction: Any transaction or attempted transaction that raises reasonable grounds to suspect money laundering, terrorism financing, sanctions evasion, or other financial crime, regardless of transaction size.
  •  AML Officer: The designated compliance contact responsible for AML/CTF oversight — currently Abhiram (abhiram@dariorganization.com).
  •  Customer Due Diligence (CDD): The process of identifying, verifying, and understanding the nature of business of a customer.
  •  Enhanced Due Diligence (EDD): Heightened CDD measures applied to higher-risk customers, transactions, or jurisdictions.
  •  Politically Exposed Person (PEP): An individual who holds or has held a prominent public function, including heads of state, senior government officials, senior military officials, and their close associates.
  •  Structuring / Smurfing: The practice of breaking up large sums of money into smaller transactions to evade reporting thresholds or AML monitoring.`,
      },
      {
        id: "a-cdd",
        title: "3. Customer Due Diligence (CDD)",
        body: `3.1  Standard CDD Requirements. All Merchants are required to complete KYC verification before accessing transaction limits above the free-tier threshold. Standard CDD comprises verification of:
  •  Full Legal Name
  •  Valid Email Address
  •  Active Mobile Number
  •  Residential or Business Address
  •  Country of Residence or Incorporation

3.2  Identity Verification. Dari Payments may request government-issued identity documents and other supporting evidence based on risk triggers or regulatory obligations, including:
  •  Individual Merchants: Government-issued photo ID (Passport, Aadhaar, Driver's Licence)
  •  Business Merchants: Certificate of Incorporation, GST registration, Memorandum of Association, beneficial ownership declarations

3.3  Payee CDD. Payees (end customers) are identified through information collected at checkout. Full KYC is not routinely applied to Payees unless triggered by risk indicators.

3.4  Ongoing CDD. CDD is an ongoing obligation. Dari Payments reserves the right to re-verify Merchant information at any time.

3.5  KYC Refusal. If a Merchant refuses or fails to provide required CDD information, Dari Payments will decline to open an account or will suspend existing access.`,
      },
      {
        id: "a-edd",
        title: "4. Enhanced Due Diligence (EDD)",
        body: `4.1  EDD Triggers. Enhanced Due Diligence is applied to the following:
  •  Merchants assigned a High or Medium-High risk score by the Platform's monitoring system
  •  Transactions above plan-based thresholds or exhibiting unusual volume or velocity
  •  Merchants operating in high-risk business sectors
  •  Merchants based in or regularly transacting with FATF high-risk or blacklisted jurisdictions
  •  Transactions involving wallet addresses flagged by blockchain analytics
  •  Merchants identified as, or associated with, Politically Exposed Persons (PEPs)
  •  Any account exhibiting patterns consistent with structuring or rapid fund movement

4.2  EDD Measures. EDD may include one or more of the following:
  •  Source of funds documentation (bank statements, business invoices, audited accounts)
  •  Beneficial ownership declarations for corporate Merchants (UBO identification)
  •  Enhanced monitoring with shorter review cycles
  •  Senior management approval prior to onboarding or continued use
  •  On-chain transaction analysis using blockchain forensics tools

4.3  PEP Screening. Merchants who are or are associated with PEPs are subject to mandatory EDD and require senior management approval.`,
      },
      {
        id: "a-risk",
        title: "5. Risk Scoring Framework",
        body: `5.1  Risk-Based Approach. Dari Payments employs a risk-based approach (RBA) as recommended by FATF. Each Merchant account and transaction is dynamically assigned a risk score based on multiple factors:

  Merchant Profile Factors:
  •  Business type and sector
  •  Jurisdiction of operation and incorporation
  •  Transaction volume and history relative to stated business purpose

  Transaction-Level Factors:
  •  Transaction frequency, size, and velocity
  •  Deviation from historical transaction patterns
  •  Originating wallet addresses and counterparty risk indicators

  Geographic Risk Factors:
  •  Transactions involving FATF-blacklisted or grey-listed jurisdictions
  •  High-risk countries for financial crime

  Network and Stablecoin Factors:
  •  Network-specific risk characteristics
  •  Cross-chain bridge activity

5.2  Risk Classification:
  •  Low Risk: Standard automated monitoring; routine review cycles.
  •  Medium Risk: Enhanced automated monitoring; periodic manual review.
  •  High Risk: Immediate manual review by AML Officer; possible transaction hold; EDD required.

5.3  Risk scores are reviewed and updated on an ongoing basis.`,
      },
      {
        id: "a-monitoring",
        title: "6. Transaction Monitoring",
        body: `6.1  Dari Payments monitors transactions through an automated risk-scoring system on an ongoing, near-real-time basis. The monitoring system analyses:
  •  Unusual or disproportionate transaction volumes relative to Merchant profile
  •  High-frequency, low-value transactions consistent with structuring
  •  Rapid movement of funds in and out of the Platform within short timeframes
  •  Multiple transactions to or from the same wallet addresses within a single day
  •  Transactions to or from wallet addresses associated with known illicit activity
  •  Sudden spikes in transaction value or frequency with no apparent business justification

6.2  Investigation. Transactions flagged by the monitoring system will be escalated to the AML Officer for manual review. The Platform may place a temporary hold during the review period.

6.3  Outcome. Following investigation, the AML Officer will clear the transaction, request additional information, file an STR, or suspend the account.

6.4  Non-Disclosure. Dari Payments will not notify any Merchant or user that their transaction has been flagged, is under investigation, or that an STR has been filed. Disclosure of this information is a criminal offence under PMLA.`,
      },
      {
        id: "a-sanctions",
        title: "7. Sanctions Screening",
        body: `7.1  Dari Payments screens all Merchants, Payees, and associated wallet addresses against the following sanctions lists:
  •  OFAC Specially Designated Nationals (SDN) List (USA)
  •  OFAC Consolidated Sanctions List
  •  UN Security Council Consolidated Sanctions List
  •  EU Consolidated List of Persons, Groups and Entities
  •  Indian government-issued sanctions and proscribed organisations lists

7.2  Screening Triggers. Sanctions screening is conducted at: account registration; KYC update; significant account activity changes; and periodically on existing accounts.

7.3  Sanctions Match Response. If a Merchant, Payee, or wallet address matches or is a close match:
  •  The account or transaction will be immediately frozen.
  •  The AML Officer will conduct a prompt investigation.
  •  If confirmed, funds will be frozen and reported to FIU-IND, OFAC, or relevant authorities.
  •  Dari Payments will not release frozen funds without regulatory clearance.

7.4  Prohibited Jurisdictions. Dari Payments does not knowingly facilitate transactions from sanctioned jurisdictions (Iran, North Korea, Syria, Cuba, Crimea, Donetsk, Luhansk).`,
      },
      {
        id: "a-str",
        title: "8. Suspicious Transaction Reporting (STR)",
        body: `8.1  Reporting Commitment. Dari Payments is committed to filing Suspicious Transaction Reports (STRs) with FIU-IND upon obtaining regulatory registration, and to the extent required in the interim.

8.2  STR Grounds. An STR will be filed when there are reasonable grounds to suspect:
  •  Funds represent proceeds of a predicate offence or link to money laundering
  •  Transaction connects to terrorism or proliferation financing
  •  Merchant or Payee is on a sanctions list or provided false identity
  •  Structuring is being used to evade transaction monitoring or KYC

8.3  STR Records. All STR investigations are documented and retained for a minimum of 5 years.

8.4  Tipping Off Prohibition. Dari Payments will not disclose that an STR has been or may be filed. Tipping off is a criminal offence under the PMLA.`,
      },
      {
        id: "a-records",
        title: "9. Record Keeping",
        body: `9.1  Dari Payments retains records for a minimum of 5 (five) years from the date of account closure or the date of the last transaction, in accordance with PMLA Rules, 2005:
  •  KYC documents, identity verification records, and supporting documentation
  •  Complete transaction records (sender, recipient, amount, network, hash, timestamp)
  •  Account opening, modification, and closure records
  •  Risk assessment and monitoring reports
  •  STR filings and related correspondence

9.2  Storage. All records are stored on India-based servers with restricted access, encryption, and audit logs.

9.3  Availability. Records will be made available to FIU-IND, Indian law enforcement agencies, and competent courts upon receipt of a valid legal direction.`,
      },
      {
        id: "a-jurisdictions",
        title: "10. Prohibited Jurisdictions",
        body: `Dari Payments does not knowingly provide Services to Merchants or facilitate transactions from:
  •  Countries subject to comprehensive OFAC sanctions (Iran, North Korea, Syria, Cuba, Crimea, Donetsk, Luhansk)
  •  Jurisdictions on the FATF Public Statement (Blacklist)
  •  Jurisdictions where stablecoin transactions are entirely prohibited by local law

If a Merchant is determined to be operating from or primarily serving users in a prohibited jurisdiction, their account will be immediately suspended.`,
      },
      {
        id: "a-cooperation",
        title: "11. Cooperation with Authorities",
        body: `11.1  Dari Payments will cooperate fully and promptly with FIU-IND, law enforcement agencies (CBI, ED, state police), competent courts, the Reserve Bank of India, and other regulatory authorities.

11.2  Information Disclosure. Account information, KYC records, and transaction data may be disclosed to competent authorities without prior notice to the Merchant.

11.3  Legal Hold. Dari Payments will preserve relevant data and records upon receiving a legal hold notice from a competent authority.`,
      },
      {
        id: "a-obligations",
        title: "12. Merchant AML Obligations",
        body: `By registering as a Merchant, you agree to:
  •  Maintain your own AML/KYC compliance programme to the extent required by local law.
  •  Not use the Platform to process payments from sanctioned individuals, entities, or jurisdictions.
  •  Not engage in structuring transactions to evade Dari Payments' monitoring.
  •  Promptly respond to all requests for information or documents from compliance.
  •  Immediately notify Dari Payments if a transaction involves illicit funds or a sanctioned party.

Failure to comply constitutes a material breach of the Terms, leading to immediate suspension, freezing of funds, and regulatory reporting.`,
      },
      {
        id: "a-amendments",
        title: "13. Amendments",
        body: `This AML/CTF Policy is a living document and will be reviewed and updated at least annually. Material amendments will be communicated to Merchants via email and Dashboard. Continued use of the Platform constitutes acceptance.

For AML/CTF compliance concerns or to report a suspicious activity, contact: Abhiram — abhiram@dariorganization.com`,
      },
    ],
  },

  withdrawal: {
    label: "Withdrawal Policy",
    icon: "ti-wallet",
    effective: "May 27, 2026",
    sections: [
      { id: "w-intro", title: "1. Introduction" },
      { id: "w-eligibility", title: "2. Eligibility" },
      { id: "w-methods", title: "3. Withdrawal Methods" },
      { id: "w-fees", title: "4. Fees & Charges" },
      { id: "w-limits", title: "5. Withdrawal Limits" },
      { id: "w-timing", title: "6. Processing Times" },
      { id: "w-auto", title: "7. Auto-Withdrawal" },
      { id: "w-holds", title: "8. Holds, Freezes & Restrictions" },
      { id: "w-refunds", title: "9. Refund Policy" },
      { id: "w-accuracy", title: "10. Wallet Address Accuracy" },
      { id: "w-unsupported", title: "11. Unsupported Tokens & Networks" },
      { id: "w-governing", title: "12. Governing Provisions" },
      { id: "w-amendments", title: "13. Amendments" },
    ],
    content: [
      {
        id: "w-intro",
        title: "1. Introduction",
        body: `This Withdrawal Policy ("Policy") governs the withdrawal of stablecoin funds from a Merchant's Custodial Wallet maintained on the Dari Payments Platform. It also sets out the rules applicable to refunds processed through the Platform on behalf of Merchants.

By registering as a Merchant and using the withdrawal features of the Platform, you agree to be bound by this Policy, which forms part of the overarching Terms and Conditions.

This Policy applies to all Merchant accounts on daripay.xyz and daripay.in.`,
      },
      {
        id: "w-eligibility",
        title: "2. Eligibility for Withdrawal",
        body: `2.1  Only registered Merchants with active, non-suspended accounts in good standing may initiate or configure withdrawals.

2.2  KYC Requirement. Merchants must have successfully completed the applicable KYC verification tier to access withdrawal functionality above the free-tier limit.

2.3  Fund Availability. Funds are available for withdrawal once:
  •  The incoming transaction has been confirmed on the respective blockchain network with the requisite number of block confirmations; and
  •  The transaction has cleared Dari Payments' internal processing and compliance review.

2.4  Funds subject to an AML hold, dispute hold, or account suspension are not available for withdrawal.`,
      },
      {
        id: "w-methods",
        title: "3. Withdrawal Methods",
        body: `3.1  Stablecoin to External Wallet. All withdrawals from the Custodial Wallet are processed exclusively as stablecoin transfers to a Merchant-designated external wallet address. Dari Payments does not offer fiat currency withdrawal, bank transfer, or any form of fiat off-ramp.

3.2  Supported Stablecoins for Withdrawal:
  •  USDC (USD Coin)
  •  USDT (Tether)
  •  EURC (Euro Coin)
  •  AUDD (Australian Dollar Digital — Novatti)
  •  PYUSD (PayPal USD)

3.3  Supported Networks for Withdrawal:
  •  Ethereum (ERC-20), Tron (TRC-20), Solana (SPL), Polygon, BNB Smart Chain (BEP-20), Stellar, Base, Avalanche (C-Chain), Arbitrum

3.4  Manual Withdrawal. Merchants may initiate a manual withdrawal at any time from the Dashboard by specifying the withdrawal amount and destination wallet address.

3.5  Auto-Withdrawal. Merchants may configure automatic withdrawal settings in the Dashboard (see Section 7).`,
      },
      {
        id: "w-fees",
        title: "4. Fees & Charges",
        body: `4.1  Platform Withdrawal Fee. A fee of 3% (three percent) is applied to the gross value of every withdrawal processed from the Custodial Wallet to an external wallet address. This fee is deducted from the withdrawal amount at the time of processing.

4.2  Blockchain Network Fees. Blockchain network fees (gas fees) are separate from and in addition to the Platform withdrawal fee. Network fees are determined by prevailing conditions on the blockchain, and are borne entirely by the Merchant.

4.3  No Hidden Charges. There are no hidden fees beyond the 3% Platform fee and applicable network fees.

4.4  Fee on Refund Withdrawals. If Merchant funds are used to process a refund to a Payee, the resulting outgoing transfer is treated as a withdrawal and the standard 3% fee applies.

4.5  Non-Refundable. Platform withdrawal fees and network fees are non-refundable once processed.

4.6  Fee Changes. Dari Payments may revise the withdrawal fee with a minimum of 30 days' prior notice.`,
      },
      {
        id: "w-limits",
        title: "5. Withdrawal Limits",
        body: `5.1  Minimum Withdrawal Amount. The minimum amount for any single withdrawal is USD 5 (five US Dollars) equivalent in the applicable stablecoin.

5.2  Maximum Withdrawal Limits. Maximum withdrawal limits per transaction and per day/month are determined by the Merchant's active plan and KYC tier, as displayed in the Dashboard.

5.3  KYC-Approved Merchants. Eligible for the maximum withdrawal limits available under their plan.

5.4  Unverified Merchants. Restricted to the free-tier withdrawal limits displayed at account registration.

5.5  Plan-Based Limits. Merchants may upgrade their plan at any time through the Dashboard to access higher limits.`,
      },
      {
        id: "w-timing",
        title: "6. Processing Times",
        body: `6.1  Instant Withdrawal. Standard withdrawals by verified Merchants in good standing are processed instantly upon request confirmation, subject to blockchain network conditions.

6.2  Delayed Withdrawal. A withdrawal may be delayed for up to 1 (one) business day in the following circumstances:
  •  The Merchant's account or transaction has been flagged for compliance review.
  •  Additional verification or documentation is required by the AML Officer.
  •  Technical issues or scheduled maintenance.

6.3  Merchant Notification. Delayed withdrawals will be communicated to the Merchant via email with an estimated timeline.

6.4  No Guarantee of On-Chain Speed. Once broadcast, the speed of final on-chain confirmation is governed by blockchain network conditions and is outside Dari Payments' control.`,
      },
      {
        id: "w-auto",
        title: "7. Auto-Withdrawal",
        body: `7.1  Auto-Withdrawal Feature. Merchants may configure automatic withdrawal settings in the Dashboard:
  •  Balance threshold trigger: Balance reaches or exceeds a specified amount.
  •  Scheduled trigger: Executes on a defined schedule (e.g., daily, weekly).

7.2  Wallet Address Configuration. Merchants are solely responsible for destination wallet address accuracy.

7.3  Fee Application. The standard 3% withdrawal fee applies to all Auto-Withdrawal transactions.

7.4  Suspension of Auto-Withdrawal. Auto-withdrawal may be suspended if the account is flagged or under investigation.

7.5  Merchant Responsibility. Merchants must ensure the destination wallet address is correct and compatible with the selected network.

7.6  No Liability for Merchant Configuration Errors. Dari Payments is not responsible for failures or losses caused by incorrect configurations or invalid addresses.`,
      },
      {
        id: "w-holds",
        title: "8. Holds, Freezes & Restrictions",
        body: `8.1  AML Hold. Dari Payments may place a hold on a pending withdrawal if flagged by compliance. Manual reviews are completed in 1-5 business days.

8.2  Dispute Hold. Credible customer disputes or chargeback-equivalent claims may cause corresponding funds to be held pending resolution.

8.3  Regulatory or Legal Hold. Court orders, regulatory directives, or law enforcement requests will cause matching funds or wallets to be frozen.

8.4  Account Suspension Hold. If an account is suspended, all pending and future withdrawals are paused. Funds are released upon successful appeal or regulatory clearance.

8.5  Duration. Holds are resolved as promptly as circumstances allow.`,
      },
      {
        id: "w-refunds",
        title: "9. Refund Policy",
        body: `9.1  Scope. Governs technical processing of refunds to Payees facilitated through the Platform.

9.2  Refund Window. Payees may request a refund from the Merchant within 7 days of the original transaction.

9.3  Merchant's Sole Authority. Refund decisions are made solely at the Merchant's discretion. Dari Payments does not mediate disputes or compel refunds.

9.4  Refund Processing Mechanics. If approved, the refund checks for sufficient wallet balance, then processes as a new stablecoin transfer back to the originating wallet address. Processing takes up to 1 business day.

9.5  Partial Refunds. Partial refunds are supported via Dashboard or API.

9.6  Platform Fee on Refunds. The standard 3% Platform fee and blockchain network gas fees apply to refunds.

9.7  No Reversal. Completed on-chain refunds are irreversible.

9.8  Merchant Responsibility. Merchants must communicate their return policies to customers.`,
      },
      {
        id: "w-accuracy",
        title: "10. Wallet Address Accuracy",
        body: `10.1  Merchant Responsibility. Merchants are solely responsible for ensuring the accuracy of:
  •  The destination wallet address for withdrawals.
  •  The selected stablecoin and network (correct token on the correct chain).

10.2  Format Validation. Dari Payments performs basic address validation, but does not verify wallet ownership.

10.3  Irreversibility. Blockchain transactions are irreversible once broadcast. Dari Payments cannot recover funds sent to an incorrect address.

10.4  Network Compatibility. Sending a stablecoin to an incompatible or unsupported network (e.g. USDT on Ethereum to a Tron address) results in permanent, irrecoverable loss of funds.

10.5  No Recovery Obligation. Dari Payments has no obligation to attempt recovery of lost funds.`,
      },
      {
        id: "w-unsupported",
        title: "11. Unsupported Tokens & Networks",
        body: `11.1  Dari Payments supports withdrawals only for explicitly listed stablecoins and networks. Attempting withdrawals to unsupported stablecoins or chains is not supported.

11.2  Changes. If support for networks or tokens is added or removed, Merchants will be notified.

11.3  No Liability. Dari Payments bears no liability for funds lost from transactions involving unsupported tokens or chains.`,
      },
      {
        id: "w-governing",
        title: "12. Governing Provisions",
        body: `This Withdrawal Policy is incorporated into and subject to Dari Payments' Terms and Conditions, Privacy Policy, and AML/CTF Policy. In the event of conflict, the Terms and Conditions shall prevail.

This Policy is governed by the laws of India. Disputes shall be resolved in Hyderabad, Telangana, India.

For withdrawal-related queries, please contact: abhiram@dariorganization.com`,
      },
      {
        id: "w-amendments",
        title: "13. Amendments",
        body: `Dari Payments reserves the right to modify this Withdrawal Policy at any time. Merchants will be notified of material changes at least 30 days in advance. Continued use of features constitutes acceptance.`,
      },
    ],
  },
  cookie: {
    label: "Cookie Policy",
    icon: "ti-cookie",
    effective: "May 27, 2026",
    sections: [
      { id: "c-intro", title: "1. What Are Cookies" },
      { id: "c-types", title: "2. Types of Cookies We Use" },
      { id: "c-control", title: "3. How to Control Cookies" },
    ],
    content: [
      {
        id: "c-intro",
        title: "1. What Are Cookies",
        body: `Cookies are small text files stored on your device when you visit our Platform. They help us provide a seamless, secure, and reliable browsing experience. By using our websites (daripay.xyz, api.daripay.xyz, pay.daripay.xyz, daripay.in, api.daripay.in, and pay.daripay.in), you consent to our use of cookies in accordance with this policy.`,
      },
      {
        id: "c-types",
        title: "2. Types of Cookies We Use",
        body: `We use the following categories of cookies:

• Essential Cookies: Necessary for the Platform to function securely and properly. These enable authentication, session maintenance, and payment flow security.
• Analytical/Performance Cookies: Allow us to count visits and traffic sources so we can measure and improve the performance of our site, primarily using privacy-preserving analytics.
• Functional Cookies: Enable enhanced functionality and personalisation, such as remembering your preferences or local settings.`,
      },
      {
        id: "c-control",
        title: "3. How to Control Cookies",
        body: `Most web browsers allow you to control cookies through their settings. You can choose to block all cookies, accept only certain cookies, or delete cookies upon closing your browser. 

Please note that blocking essential cookies may disrupt your experience and prevent you from completing transactions through our checkout interface.`,
      },
    ],
  },
  compliance: {
    label: "Compliance Policy",
    icon: "ti-shield-check",
    effective: "May 27, 2026",
    sections: [
      { id: "comp-intro", title: "1. Compliance Commitment" },
      { id: "comp-framework", title: "2. Regulatory Framework" },
      { id: "comp-partner", title: "3. Partner Networks" },
    ],
    content: [
      {
        id: "comp-intro",
        title: "1. Compliance Commitment",
        body: `We maintain compliance with all applicable regulations across jurisdictions where we operate. This includes financial services regulations, data protection laws (GDPR, CCPA, and Indian Digital Personal Data Protection Act), and blockchain-specific regulations. We work with legal experts and compliance partners to ensure our platform meets all regulatory requirements.`,
      },
      {
        id: "comp-framework",
        title: "2. Regulatory Framework",
        body: `As a technology infrastructure provider (and not a regulated financial institution or money service business), we do not process fiat currency directly or store digital assets in standard banking structures. Our services are strictly software-based, facilitating stablecoin payment collection.

Merchants are solely responsible for their own tax, GST, customs, and sector-specific regulatory compliance in their respective jurisdictions.`,
      },
      {
        id: "comp-partner",
        title: "3. Partner Networks",
        body: `We operate in tandem with licensed custody providers, bridge protocols, and financial institutions to settle payments securely. For custom enterprise integrations requiring bespoke compliance audits, please contact compliance@daripay.xyz.`,
      },
    ],
  },
  security: {
    label: "Security Policy",
    icon: "ti-lock",
    effective: "May 27, 2026",
    sections: [
      { id: "sec-infra", title: "1. Infrastructure Security" },
      { id: "sec-api", title: "2. API Security" },
      { id: "sec-wallet", title: "3. Wallet Security" },
      { id: "sec-reporting", title: "4. Vulnerability Reporting" },
    ],
    content: [
      {
        id: "sec-infra",
        title: "1. Infrastructure Security",
        body: `Our infrastructure is built on industry-leading cloud providers with SOC 2 compliance. All data is encrypted at rest and in transit using AES-256 and TLS 1.3.`,
      },
      {
        id: "sec-api",
        title: "2. API Security",
        body: `All API requests require authentication via API keys. We support IP whitelisting, rate limiting, and webhook signature verification to ensure secure integrations.`,
      },
      {
        id: "sec-wallet",
        title: "3. Wallet Security",
        body: `Private keys are never stored on our servers. We use secure key management systems and multi-signature wallets for enhanced security.`,
      },
      {
        id: "sec-reporting",
        title: "4. Vulnerability Reporting",
        body: `If you discover a security vulnerability, please report it immediately to security@daripay.xyz. We appreciate your assistance in keeping the Platform safe.`,
      },
    ],
  },
};

const COLORS = {
  terms: { bg: "#EAF3DE", text: "#3B6D11", border: "#639922" },
  privacy: { bg: "#E6F1FB", text: "#185FA5", border: "#378ADD" },
  aml: { bg: "#FAEEDA", text: "#854F0B", border: "#BA7517" },
  withdrawal: { bg: "#E1F5EE", text: "#0F6E56", border: "#1D9E75" },
  cookie: { bg: "#F1EAFB", text: "#681DA8", border: "#8A3CDE" },
  compliance: { bg: "#FBEAEF", text: "#A81D43", border: "#DE3C6E" },
  security: { bg: "#EAF5F8", text: "#187687", border: "#2EA0B5" },
};

export function PoliciesPage({ initialTab = 'terms' }: { initialTab?: string }) {
  const [active, setActive] = useState(initialTab);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setActive(initialTab);
    setActiveSection(null);
    window.scrollTo(0, 0);
  }, [initialTab]);

  const policy = POLICIES[active as keyof typeof POLICIES];
  const color = COLORS[active as keyof typeof COLORS];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveSection(id);
  };

  return (
    <>
      <SEO
        title={`${policy.label} — Dari Payments Legal Documentation`}
        description={`Read the official ${policy.label} of Dari Payments. Operated by Dari Organization. Effective as of ${policy.effective}.`}
        url={`https://daripay.xyz/${
          active === 'terms' ? 'terms-of-service' : 
          active === 'privacy' ? 'privacy-policy' : 
          active === 'aml' ? 'aml-policy' : 
          active === 'withdrawal' ? 'withdrawal-policy' :
          active === 'cookie' ? 'cookie-policy' :
          active === 'compliance' ? 'compliance' :
          'security'
        }`}
      />
      <LandingLayout>
        <div className="max-w-[760px] mx-auto px-6 py-24 min-h-screen">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Legal Documentation
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Dari Payments — Policy Documents
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Operated by Dari Organization · Effective May 27, 2026 · Hyderabad, Telangana, India
              </p>
            </div>
          </div>

          {/* Centered Legal Content Card */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 md:p-10 shadow-sm">
            <div
              className="inline-flex items-center gap-2 rounded-lg px-4 py-1.5 mb-8"
              style={{ backgroundColor: color.bg }}
            >
              <i className={`ti ${policy.icon} text-sm`} style={{ color: color.text }} aria-hidden="true" />
              <span className="text-xs font-semibold" style={{ color: color.text }}>
                {policy.label}
              </span>
              <span className="text-[10px] opacity-75 font-medium" style={{ color: color.text }}>
                · Effective {policy.effective}
              </span>
            </div>

            {/* Loop through sections */}
            <div className="space-y-12">
              {policy.content.map((sec) => (
                <div key={sec.id} id={sec.id} className="scroll-mt-24 border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                  <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 tracking-tight">
                    {sec.title}
                  </h2>

                  {sec.notice && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4 mb-4">
                      <p className="text-xs md:text-sm text-amber-900 leading-relaxed font-medium">
                        {sec.notice}
                      </p>
                    </div>
                  )}

                  {sec.body && (
                    <div className="text-xs md:text-sm leading-relaxed text-gray-600 font-normal whitespace-pre-line font-sans">
                      {sec.body}
                    </div>
                  )}

                  {sec.definitions && (
                    <div className="mt-4 divide-y divide-gray-100 border-t border-b border-gray-100">
                      {sec.definitions.map((d) => (
                        <div key={d.term} className="py-3 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 md:gap-4 items-start">
                          <span className="text-xs font-semibold text-gray-900">{d.term}</span>
                          <span className="text-xs text-gray-500 leading-relaxed">{d.def}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Grievance Contacts Footer Box */}
            <div className="mt-12 p-6 bg-gray-50 border border-gray-150 rounded-xl">
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                <strong className="text-gray-900 font-semibold block mb-1">Questions about this policy?</strong>
                If you have questions, contact our designated Grievance Compliance Team at{' '}
                <a href="mailto:abhiram@dariorganization.com" className="font-semibold underline hover:text-black transition-colors" style={{ color: color.text }}>
                  abhiram@dariorganization.com
                </a>
                {' '}· Dari Organization, operating as Dari Payments · daripay.xyz / daripay.in
              </p>
            </div>

            {/* Policy Navigation Footer Links */}
            <div className="mt-12 pt-8 border-t border-gray-150 flex flex-wrap justify-center gap-x-6 gap-y-3">
              {Object.entries(POLICIES).map(([key, p]) => {
                const isActive = active === key;
                const pathMap: Record<string, string> = {
                  terms: "/terms-of-service",
                  privacy: "/privacy-policy",
                  cookie: "/cookie-policy",
                  aml: "/aml-policy",
                  withdrawal: "/withdrawal-policy",
                  compliance: "/compliance",
                  security: "/security",
                };
                const to = pathMap[key] || `/${key}-policy`;
                return (
                  <Link
                    key={key}
                    to={to}
                    onClick={() => {
                      setActive(key);
                      setActiveSection(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`text-xs md:text-sm font-semibold transition-all hover:text-gray-900 outline-none cursor-pointer ${
                      isActive
                        ? 'text-gray-950 underline underline-offset-4 decoration-2 font-bold'
                        : 'text-gray-400 font-medium'
                    }`}
                  >
                    {p.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </LandingLayout>
    </>
  );
}
