// API Diagnostics Tool
// Run this in browser console to check API connectivity

export async function runApiDiagnostics() {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('merchant_token');
  const apiKey = localStorage.getItem('api_key');

  console.log('🔍 API Diagnostics Starting...\n');
  console.log('📍 Base URL:', baseUrl);
  console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : '❌ NOT FOUND');
  console.log('🔐 API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ NOT FOUND');
  console.log('\n');

  const endpoints = [
    { name: 'Health Check', url: '/health', auth: false },
    { name: 'Auth Me', url: '/auth/me', auth: true },
    { name: 'Merchant Profile', url: '/merchant/profile', auth: true },
    { name: 'Wallet Dashboard', url: '/merchant/wallets/dashboard', auth: true },
    { name: 'Subscriptions', url: '/subscriptions?page=1&page_size=20', auth: true },
    { name: 'Subscription Plans', url: '/subscriptions/plans?page=1&page_size=20', auth: true },
    { name: 'Payment Links', url: '/payment-links?page=1&page_size=20', auth: true },
    { name: 'Promo Codes', url: '/api/business/promo/list?page=1&page_size=20', auth: true },
  ];

  for (const endpoint of endpoints) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (endpoint.auth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (endpoint.auth && apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const response = await fetch(`${baseUrl}${endpoint.url}`, {
        method: 'GET',
        headers,
      });

      const status = response.status;
      const statusText = response.statusText;
      
      let result = '';
      if (status === 200) {
        result = '✅ SUCCESS';
      } else if (status === 401) {
        result = '🔒 UNAUTHORIZED (check token)';
      } else if (status === 404) {
        result = '❌ NOT FOUND (route missing)';
      } else if (status === 403) {
        result = '🚫 FORBIDDEN (check permissions)';
      } else {
        result = `⚠️ ${status} ${statusText}`;
      }

      console.log(`${result} - ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      if (status !== 200) {
        try {
          const errorData = await response.json();
          console.log(`   Error:`, errorData);
        } catch {
          const errorText = await response.text();
          console.log(`   Error:`, errorText);
        }
      }
      console.log('');
    } catch (error: any) {
      console.log(`💥 NETWORK ERROR - ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('✨ Diagnostics Complete!\n');
  console.log('💡 Common Issues:');
  console.log('   - Backend not running: Start with `uvicorn app.main:app --reload`');
  console.log('   - CORS errors: Check CORS_ORIGINS in backend .env');
  console.log('   - 404 errors: Routes not registered in backend');
  console.log('   - 401 errors: Token expired or invalid - try logging in again');
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  (window as any).runApiDiagnostics = runApiDiagnostics;
  console.log('💡 Run `runApiDiagnostics()` in console to test API endpoints');
}
