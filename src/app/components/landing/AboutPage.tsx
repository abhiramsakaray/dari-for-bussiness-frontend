import { GenericPage } from './GenericPage';

export function AboutPage() {
  return (
    <GenericPage
      label="Company"
      title="About Dari for Business"
      subtitle="Building the future of stablecoin payments for global businesses."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Our Mission</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We're building the infrastructure for businesses to accept stablecoin payments globally.
            Our mission is to make crypto payments as simple as traditional payment processing,
            while maintaining the benefits of blockchain technology.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Why We Built This</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Traditional payment systems are slow, expensive, and exclude billions of people.
            Stablecoins offer instant settlement, low fees, and global accessibility. We're making
            it easy for any business to tap into this new financial infrastructure.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Our Values</h2>
          <ul className="space-y-3">
            <li className="text-sm text-gray-600 leading-relaxed flex gap-3">
              <span className="text-black font-semibold">Transparency:</span>
              Clear pricing, open communication, no hidden fees.
            </li>
            <li className="text-sm text-gray-600 leading-relaxed flex gap-3">
              <span className="text-black font-semibold">Security:</span>
              Your funds and data are protected with industry-leading security.
            </li>
            <li className="text-sm text-gray-600 leading-relaxed flex gap-3">
              <span className="text-black font-semibold">Simplicity:</span>
              Complex technology, simple experience.
            </li>
          </ul>
        </div>
      </div>
    </GenericPage>
  );
}
