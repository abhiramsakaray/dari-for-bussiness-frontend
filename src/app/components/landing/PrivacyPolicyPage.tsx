import { GenericPage } from './GenericPage';

export function PrivacyPolicyPage() {
  return (
    <GenericPage
      label="Legal"
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">1. Information We Collect</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We collect information you provide directly to us, such as when you create an account,
            make a payment, or contact us for support. This may include your name, email address,
            wallet addresses, and transaction data.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">2. How We Use Your Information</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We use the information we collect to provide, maintain, and improve our services,
            process transactions, send you technical notices and support messages, and respond
            to your comments and questions.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">3. Information Sharing</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We do not share your personal information with third parties except as described in
            this policy. We may share information with service providers who perform services on
            our behalf, or when required by law.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">4. Data Security</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We take reasonable measures to help protect your personal information from loss,
            theft, misuse, unauthorized access, disclosure, alteration, and destruction.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">5. Your Rights</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            You have the right to access, update, or delete your personal information at any time.
            You can do this through your account settings or by contacting us directly.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">6. Contact Us</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@dari.business" className="text-black underline">
              privacy@dari.business
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
