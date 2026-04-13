import { GenericPage } from './GenericPage';

export function StatusPage() {
  const services = [
    { name: 'API', status: 'operational' },
    { name: 'Dashboard', status: 'operational' },
    { name: 'Webhooks', status: 'operational' },
    { name: 'Payment Processing', status: 'operational' },
  ];

  return (
    <GenericPage
      label="Status"
      title="System Status"
      subtitle="Real-time status of all Dari services."
    >
      <div className="space-y-6 not-prose">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-semibold text-green-900">
              All Systems Operational
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between"
            >
              <span className="text-sm font-medium text-black">{service.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 capitalize">{service.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold mb-4 text-black">Recent Incidents</h3>
          <p className="text-sm text-gray-500">No incidents reported in the last 30 days.</p>
        </div>
      </div>
    </GenericPage>
  );
}
