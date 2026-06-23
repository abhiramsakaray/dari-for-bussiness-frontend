import React, { useState, useEffect } from 'react';
import { BentoLayout } from './BentoLayout';
import { chainpeService, MerchantProfile, CheckoutSettings } from '../../services/chainpe';
import { toast } from 'sonner';
import { Palette, Upload, Loader2, Save } from 'lucide-react';

export function CheckoutCustomization() {
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Settings State
  const [theme, setTheme] = useState<string>('light');
  const [primaryColor, setPrimaryColor] = useState<string>('');
  const [requirePhone, setRequirePhone] = useState<boolean>(false);
  const [requireBillingAddress, setRequireBillingAddress] = useState<boolean>(false);
  const [storeName, setStoreName] = useState<string>('');
  const [supportEmail, setSupportEmail] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await chainpeService.getMerchantProfile();
      setProfile(data);
      
      if (data.checkout_settings) {
        setTheme(data.checkout_settings.theme || 'light');
        setPrimaryColor(data.checkout_settings.primary_color || '');
        setRequirePhone(data.checkout_settings.require_phone || false);
        setRequireBillingAddress(data.checkout_settings.require_billing_address || false);
        setStoreName(data.checkout_settings.store_name || '');
        setSupportEmail(data.checkout_settings.support_email || '');
      } else {
        // Defaults
        setStoreName(data.name || '');
        setSupportEmail(data.email || '');
      }

      if (data.logo_url) {
        setLogoUrl(data.logo_url);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customization settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const checkoutSettings: CheckoutSettings = {
        theme,
        primary_color: primaryColor,
        require_phone: requirePhone,
        require_billing_address: requireBillingAddress,
        store_name: storeName,
        support_email: supportEmail
      };

      await chainpeService.updateMerchantProfile({ checkout_settings: checkoutSettings });
      toast.success('Checkout settings updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const res = await chainpeService.uploadLogo(file);
      setLogoUrl(res.logo_url);
      toast.success('Logo uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <BentoLayout activePage="customization">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BentoLayout>
    );
  }

  return (
    <BentoLayout activePage="customization">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Checkout Customization</h1>
          <p className="text-muted-foreground mt-1">
            Customize the appearance and behavior of your public checkout pages.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            
            {/* Visual Settings */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-indigo-500" />
                Visual Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Store Logo</label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a logo to display on your checkout page. Max size 2MB.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden relative">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Store Logo" className="h-full w-full object-contain" />
                      ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-700" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        {uploadingLogo ? 'Uploading...' : 'Choose File'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-4" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={primaryColor || '#2563eb'} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-9 w-9 p-0 border-0 rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm uppercase"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Theme</label>
                    <select 
                      value={theme} 
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Information & Fields */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4">Checkout Fields & Info</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Store Name</label>
                    <input 
                      type="text" 
                      value={storeName} 
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="Your Store Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Support Email</label>
                    <input 
                      type="email" 
                      value={supportEmail} 
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="support@yourstore.com"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={requirePhone}
                      onChange={(e) => setRequirePhone(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Require Customer Phone Number</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={requireBillingAddress}
                      onChange={(e) => setRequireBillingAddress(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Require Billing Address</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 bg-foreground text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div>
            <div className="sticky top-24 bg-gray-50 rounded-xl border p-4">
              <h3 className="text-sm font-semibold mb-4 text-center">Live Preview</h3>
              
              <div 
                className="rounded-2xl shadow-xl overflow-hidden border border-gray-200 flex"
                style={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  height: '550px'
                }}
              >
                {/* Left Column Equivalent */}
                <div 
                  className="flex flex-col p-8 text-white relative overflow-hidden w-[45%]"
                  style={{ background: primaryColor || 'linear-gradient(165deg, #2563eb 0%, #1d4ed8 40%, #1e3a8a 100%)' }}
                >
                  {/* Decorative Circles */}
                  <div className="absolute -bottom-16 -left-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                  <div className="absolute top-10 -right-10 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    {logoUrl ? (
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center p-1 overflow-hidden shadow-sm">
                        <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
                        {(storeName || 'D')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="font-bold text-base">{storeName || 'Dari Payments'}</div>
                  </div>
                  
                  {/* Price Box */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mb-5 relative z-10">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Total Amount</div>
                    <div className="text-3xl font-extrabold tracking-tight">$49.99</div>
                  </div>

                  {/* Timer Box */}
                  <div className="bg-white/10 border border-white/10 rounded-xl p-3 flex items-center gap-2 mb-4 relative z-10">
                    <div className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                    <span className="text-xs font-medium opacity-90 flex-1">Expires in</span>
                    <span className="text-sm font-bold text-yellow-400">29:59</span>
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2 py-2 px-3 bg-white/10 border border-white/10 rounded-xl mt-auto relative z-10">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-xs font-medium opacity-90">Enter your details</span>
                  </div>
                </div>
                
                {/* Right Column Equivalent */}
                <div className="p-8 flex-1 flex flex-col" style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff' }}>
                  <div className="font-bold mb-6 text-lg">Payment Options</div>
                  
                  {/* Dummy options */}
                  <div className="space-y-4 flex-1">
                    <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                      <div className="h-4 w-24 bg-gray-300/50 rounded" />
                    </div>
                    <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                      <div className="h-4 w-32 bg-gray-300/50 rounded" />
                    </div>
                  </div>

                  {supportEmail && (
                    <div className="text-center mt-4 text-xs opacity-60">
                      Need help? <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </BentoLayout>
  );
}
