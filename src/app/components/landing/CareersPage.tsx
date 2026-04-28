import { GenericPage } from './GenericPage';

export function CareersPage() {
  return (
    <GenericPage
      label="Careers"
      title="Join our team"
      subtitle="Help us build the future of stablecoin payments."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Why Work With Us</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We're a small, focused team building infrastructure that will power the next
            generation of global payments. Work on challenging problems with cutting-edge
            technology in a remote-first environment.
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Interested in joining our team? Send us your resume at{' '}
            <a href="mailto:careers@daripay.xyz" className="text-black underline">
              careers@daripay.xyz
            </a>
          </p>
        </div>
      </div>
    </GenericPage>
  );
}
