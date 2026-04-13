import { GenericPage } from './GenericPage';

export function TermsOfServicePage() {
  return (
    <GenericPage
      label="Legal"
      title="Terms of Service"
      subtitle="The terms and conditions for using Dari for Business."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">1. Acceptance of Terms</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            By accessing and using Dari for Business, you accept and agree to be bound by the
            terms and provision of this agreement.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">2. Use of Service</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            You agree to use the service only for lawful purposes and in accordance with these
            Terms. You are responsible for maintaining the security of your account and API keys.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">3. Payment Processing</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            All payments are processed on blockchain networks. Transactions are final and
            irreversible. We are not responsible for blockchain network fees or delays.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">4. Fees and Charges</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Our pricing is transparent and available on our pricing page. We reserve the right
            to modify our fees with 30 days notice to existing customers.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">5. Termination</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We may terminate or suspend your account at any time for violations of these Terms.
            You may cancel your account at any time through your account settings.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">6. Limitation of Liability</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            To the maximum extent permitted by law, Dari for Business shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">7. Contact</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            For questions about these Terms, contact us at{' '}
            <a href="mailto:legal@dari.business" className="text-black underline">
              legal@dari.business
            </a>
          </p>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 font-mono">
            Last updated: January 2024
          </p>
        </div>
      </div>
    </GenericPage>
  );
}
