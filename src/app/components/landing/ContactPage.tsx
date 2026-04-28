import { GenericPage } from './GenericPage';

export function ContactPage() {
  return (
    <GenericPage
      label="Contact"
      title="Get in touch"
      subtitle="Have questions? We're here to help."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold mb-2 text-black">Sales</h3>
            <p className="text-sm text-gray-600 mb-2">
              Interested in using Dari for your business?
            </p>
            <a
              href="mailto:sales@daripay.xyz"
              className="text-sm text-black underline hover:no-underline"
            >
              sales@daripay.xyz
            </a>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-2 text-black">Support</h3>
            <p className="text-sm text-gray-600 mb-2">
              Need help with your account or integration?
            </p>
            <a
              href="mailto:support@daripay.xyz"
              className="text-sm text-black underline hover:no-underline"
            >
              support@daripay.xyz
            </a>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-2 text-black">Partnerships</h3>
            <p className="text-sm text-gray-600 mb-2">
              Interested in partnering with Dari?
            </p>
            <a
              href="mailto:partnerships@daripay.xyz"
              className="text-sm text-black underline hover:no-underline"
            >
              partnerships@daripay.xyz
            </a>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-2 text-black">Press</h3>
            <p className="text-sm text-gray-600 mb-2">
              Media inquiries and press kit.
            </p>
            <a
              href="mailto:press@daripay.xyz"
              className="text-sm text-black underline hover:no-underline"
            >
              press@daripay.xyz
            </a>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h3 className="text-base font-semibold mb-4 text-black">Send us a message</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-black outline-none focus:border-gray-400 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-black outline-none focus:border-gray-400 transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-black outline-none focus:border-gray-400 transition-colors resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-black text-white rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </GenericPage>
  );
}
