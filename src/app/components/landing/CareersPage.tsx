import { GenericPage } from './GenericPage';

export function CareersPage() {
  const positions = [
    {
      title: 'Senior Backend Engineer',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'Frontend Developer',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'Product Designer',
      location: 'Remote',
      type: 'Full-time',
    },
  ];

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
          <h2 className="text-2xl font-bold mb-4 text-black">Open Positions</h2>
          <div className="space-y-3 not-prose">
            {positions.map((position) => (
              <div
                key={position.title}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold mb-2 text-black">
                      {position.title}
                    </h3>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{position.location}</span>
                      <span>•</span>
                      <span>{position.type}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full whitespace-nowrap">
                    HIRING
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Don't see a position that fits? Send us your resume at{' '}
            <a href="mailto:careers@dari.business" className="text-black underline">
              careers@dari.business
            </a>
          </p>
        </div>
      </div>
    </GenericPage>
  );
}
