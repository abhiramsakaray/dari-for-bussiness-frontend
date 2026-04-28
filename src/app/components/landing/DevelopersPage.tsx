import { GenericPage } from './GenericPage';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function DevelopersPage() {
  return (
    <GenericPage
      label="Developers"
      title="Built for developers"
      subtitle="Simple APIs, comprehensive documentation, and powerful SDKs to integrate stablecoin payments."
    >
      <div className="space-y-12 not-prose">
        <FullDocumentation />
      </div>
    </GenericPage>
  );
}

function FullDocumentation() {
  return (
    <>
      {/* Quick Start */}
      <Section title="Quick Start">
        <p className="text-sm text-gray-600 mb-6">
          Accept crypto payments across 8+ blockchains with just a few lines of code.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Installation</h4>
            <CodeBlock
              language="bash"
              code={`npm install daripayments`}
            />
          </div>

          <div>
            <h4 className="font-semibold mb-3">Get Your API Key</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Go to <a href="/register" className="text-black underline hover:no-underline">Dashboard</a> and create an account</li>
              <li>Navigate to Settings → API Keys</li>
              <li>Click "Create New Key"</li>
              <li>Copy your API key and keep it secure</li>
            </ol>
          </div>
        </div>
      </Section>

      {/* Code Example */}
      <Section title="Server-Side Integration">
        <CodeBlock
          language="typescript"
          title="create-payment.ts"
          code={`import { DariApi } from 'daripayments';

const dari = new DariApi(process.env.DARI_API_KEY);

const payment = await dari.payments.createPayment({
  amount: 99.99,
  currency: 'USD',
  customerEmail: 'customer@example.com',
  accepted_chains: ['polygon', 'base', 'bsc'],
  accepted_tokens: ['USDC', 'USDT'],
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
});

// Redirect to checkout
window.location.href = payment.checkout_url;`}
        />
      </Section>

      {/* Supported Chains */}
      <Section title="Supported Blockchains & Tokens">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-3">Blockchains</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Polygon</li>
              <li>• Base</li>
              <li>• BSC</li>
              <li>• Stellar</li>
              <li>• Tron</li>
              <li>• Avalanche</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-3">Tokens</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• USDC</li>
              <li>• USDT</li>
              <li>• DAI</li>
              <li>• Native tokens</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Resources */}
      <Section title="Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'NPM Package', url: 'https://www.npmjs.com/package/daripayments' },
            { title: 'GitHub Repository', url: 'https://github.com/Dari-Organization/daripayments-sdk' },
            { title: 'API Documentation', url: 'https://docs.daripay.xyz' },
            { title: 'Get API Key', url: '/register' },
          ].map((resource) => (
            <a
              key={resource.title}
              href={resource.url}
              target={resource.url.startsWith('http') ? '_blank' : undefined}
              rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <h4 className="font-semibold mb-1">{resource.title}</h4>
              <p className="text-xs text-gray-500 truncate">{resource.url}</p>
            </a>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <div className="flex gap-3 pt-8">
        <a
          href="/register"
          className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          Get Started
        </a>
        <a
          href="/api-reference"
          className="px-6 py-3 bg-transparent border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-400 transition-all"
        >
          API Reference
        </a>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-black">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ code, language, title }: { code: string; language: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
            <span className="font-mono text-xs text-zinc-400">{title}</span>
            <span className="text-xs text-zinc-500">{language}</span>
          </div>
        )}
        <div className="relative">
          <pre className="p-4 overflow-x-auto text-sm">
            <code className="text-zinc-100 font-mono whitespace-pre">{code}</code>
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-zinc-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
