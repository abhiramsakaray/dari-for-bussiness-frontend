import { GenericPage } from './GenericPage';

export function DevelopersPage() {
  return (
    <GenericPage
      label="Developers"
      title="Built for developers"
      subtitle="Simple APIs, comprehensive documentation, and powerful SDKs to integrate stablecoin payments."
    >
      <div className="not-prose">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="font-mono text-xs text-zinc-500 ml-2">create-payment.js</span>
          </div>
          <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
            <div className="flex gap-4">
              <div className="text-zinc-600 select-none text-right">
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
                <div>8</div>
                <div>9</div>
              </div>
              <div>
                <div>
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-blue-300">response</span>{' '}
                  <span className="text-zinc-400">=</span>{' '}
                  <span className="text-purple-400">await</span>{' '}
                  <span className="text-blue-300">fetch</span>
                  <span className="text-zinc-400">(</span>
                </div>
                <div>
                  {'  '}
                  <span className="text-green-300">'https://api.dari.business/v1/payments'</span>
                  <span className="text-zinc-400">,</span>
                </div>
                <div>
                  {'  '}
                  <span className="text-zinc-400">{'{'}</span>
                </div>
                <div>
                  {'    '}
                  <span className="text-yellow-300">method</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-green-300">'POST'</span>
                  <span className="text-zinc-400">,</span>
                </div>
                <div>
                  {'    '}
                  <span className="text-yellow-300">headers</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-zinc-400">{'{'}</span>{' '}
                  <span className="text-green-300">'Authorization'</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-green-300">`Bearer $</span>
                  <span className="text-zinc-400">{'{'}</span>
                  <span className="text-blue-300">apiKey</span>
                  <span className="text-zinc-400">{'}'}</span>
                  <span className="text-green-300">`</span>{' '}
                  <span className="text-zinc-400">{'}'}</span>
                  <span className="text-zinc-400">,</span>
                </div>
                <div>
                  {'    '}
                  <span className="text-yellow-300">body</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-blue-300">JSON</span>
                  <span className="text-zinc-400">.</span>
                  <span className="text-blue-300">stringify</span>
                  <span className="text-zinc-400">({'{'}</span>{' '}
                  <span className="text-yellow-300">amount</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-orange-300">100</span>
                  <span className="text-zinc-400">,</span>{' '}
                  <span className="text-yellow-300">currency</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-green-300">'USDC'</span>{' '}
                  <span className="text-zinc-400">{'}'})</span>
                </div>
                <div>
                  {'  '}
                  <span className="text-zinc-400">{'}'}</span>
                </div>
                <div>
                  <span className="text-zinc-400">)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'REST API',
              desc: 'Simple, predictable REST endpoints for all payment operations.',
            },
            {
              title: 'Webhooks',
              desc: 'Real-time notifications for payment events and status changes.',
            },
            {
              title: 'SDKs',
              desc: 'Official libraries for Node.js, Python, Ruby, and more.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all"
            >
              <h3 className="text-sm font-semibold mb-2 text-black">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <a
            href="#/api-reference"
            className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            View API Docs
          </a>
          <a
            href="#/register"
            className="px-6 py-3 bg-transparent border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-400 transition-all"
          >
            Get API Key
          </a>
        </div>
      </div>
    </GenericPage>
  );
}
