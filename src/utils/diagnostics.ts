/**
 * Diagnostic utilities to debug currency encoding issues
 */

export function diagnoseCurrencyEncoding(data: any) {
  console.group('🔍 Currency Encoding Diagnostics');
  
  // Check if data has currency fields
  if (data.amount_fiat_local) {
    const local = data.amount_fiat_local;
    
    console.log('📊 Local Currency Data:', {
      currency: local.local_currency,
      symbol: local.local_symbol,
      symbolCharCode: local.local_symbol?.charCodeAt(0),
      symbolHex: local.local_symbol?.split('').map((c: string) => 
        '0x' + c.charCodeAt(0).toString(16)
      ).join(' '),
      displayLocal: local.display_local,
      amount: local.amount_local,
    });
    
    // Check if symbol is corrupted
    if (local.local_symbol === '?') {
      console.error('❌ Currency symbol is corrupted (showing as ?)');
      console.log('Expected for INR: ₹ (U+20B9)');
      console.log('Received: ? (U+003F)');
      console.log('This indicates backend is not sending UTF-8 encoded data');
    } else if (local.local_symbol === '₹') {
      console.log('✅ Currency symbol is correct');
    } else {
      console.warn('⚠️ Unexpected currency symbol:', local.local_symbol);
    }
    
    // Check display_local field
    if (local.display_local?.includes('?')) {
      console.error('❌ display_local contains ? character');
      console.log('Backend needs to fix UTF-8 encoding');
    } else if (local.display_local?.includes('₹')) {
      console.log('✅ display_local has correct symbol');
    }
  } else {
    console.warn('⚠️ No amount_fiat_local field found');
    console.log('Payment data:', data);
  }
  
  console.groupEnd();
}

export function testUTF8Support() {
  console.group('🧪 UTF-8 Support Test');
  
  const testSymbols = {
    'INR (Rupee)': '₹',
    'EUR (Euro)': '€',
    'GBP (Pound)': '£',
    'JPY (Yen)': '¥',
    'BDT (Taka)': '৳',
    'PKR (Rupee)': '₨',
  };
  
  console.log('Testing currency symbols:');
  Object.entries(testSymbols).forEach(([name, symbol]) => {
    console.log(`${name}: ${symbol} (U+${symbol.charCodeAt(0).toString(16).toUpperCase()})`);
  });
  
  // Test if browser can display these
  const testString = '₹8,867.99';
  console.log('Test string:', testString);
  console.log('Char codes:', testString.split('').map(c => 
    `${c}:U+${c.charCodeAt(0).toString(16).toUpperCase()}`
  ).join(' '));
  
  console.groupEnd();
}

export function analyzeAPIResponse(response: any) {
  console.group('📡 API Response Analysis');
  
  console.log('Response type:', typeof response);
  console.log('Has data:', !!response.data);
  
  if (response.headers) {
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Has charset:', response.headers['content-type']?.includes('charset'));
  }
  
  if (response.data) {
    // Check if it's an array of payments
    if (Array.isArray(response.data.payments)) {
      console.log('Number of payments:', response.data.payments.length);
      if (response.data.payments.length > 0) {
        console.log('First payment sample:');
        diagnoseCurrencyEncoding(response.data.payments[0]);
      }
    } else if (response.data.amount_fiat_local) {
      // Single payment
      diagnoseCurrencyEncoding(response.data);
    }
  }
  
  console.groupEnd();
}

// Export a global diagnostic function for easy console access
if (typeof window !== 'undefined') {
  (window as any).diagnoseCurrency = {
    test: testUTF8Support,
    analyze: analyzeAPIResponse,
    diagnose: diagnoseCurrencyEncoding,
  };
  
  console.log('💡 Diagnostic tools available:');
  console.log('  window.diagnoseCurrency.test() - Test UTF-8 support');
  console.log('  window.diagnoseCurrency.analyze(response) - Analyze API response');
  console.log('  window.diagnoseCurrency.diagnose(data) - Diagnose currency data');
}
