import { GenericPage } from './GenericPage';

export function SecurityPage() {
  return (
    <GenericPage
      label="Security"
      title="Security & Compliance"
      subtitle="How we protect your data and funds."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Infrastructure Security</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Our infrastructure is built on industry-leading cloud providers with SOC 2 compliance.
            All data is encrypted at rest and in transit using AES-256 and TLS 1.3.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">API Security</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            All API requests require authentication via API keys. We support IP whitelisting,
            rate limiting, and webhook signature verification to ensure secure integrations.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Wallet Security</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Private keys are never stored on our servers. We use secure key management systems
            and multi-signature wallets for enhanced security.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Compliance</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We comply with AML/KYC regulations and work with licensed partners to ensure
            regulatory compliance across jurisdictions.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Report a Vulnerability</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you discover a security vulnerability, please report it to{' '}
            <a href="mailto:security@daripay.xyz" className="text-black underline">
              security@daripay.xyz
            </a>
          </p>
        </div>
      </div>
    </GenericPage>
  );
}
