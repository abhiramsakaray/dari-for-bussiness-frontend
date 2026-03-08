import React, { useState } from 'react';
import { useSubmitPayerData } from '../../../hooks/useAnalytics';
import { PayerDataCollect } from '../../../types/api.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

interface PayerDataFormProps {
  sessionId: string;
  onComplete: () => void;
  onSkip?: () => void;
}

export function PayerDataForm({ sessionId, onComplete, onSkip }: PayerDataFormProps) {
  const [form, setForm] = useState<PayerDataCollect>({});
  const [showAddress, setShowAddress] = useState(false);
  const submitMutation = useSubmitPayerData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMutation.mutateAsync({ sessionId, data: form });
    onComplete();
  };

  const updateField = (field: keyof PayerDataCollect, value: string) => {
    setForm((f) => ({ ...f, [field]: value || undefined }));
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Your Information
        </CardTitle>
        <CardDescription>
          Please provide your details before proceeding to payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required fields */}
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address *"
                className="pl-10"
                value={form.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Full name *"
                className="pl-10"
                value={form.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Phone (optional)"
                className="pl-10"
                value={form.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Toggle billing address */}
          {!showAddress && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddress(true)}
              className="text-muted-foreground"
            >
              <MapPin className="w-4 h-4 mr-1" />
              Add billing address
            </Button>
          )}

          {/* Billing address fields */}
          {showAddress && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Billing Address
              </p>
              <Input
                placeholder="Address line 1"
                value={form.billing_address_line1 || ''}
                onChange={(e) => updateField('billing_address_line1', e.target.value)}
              />
              <Input
                placeholder="Address line 2 (optional)"
                value={form.billing_address_line2 || ''}
                onChange={(e) => updateField('billing_address_line2', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={form.billing_city || ''}
                  onChange={(e) => updateField('billing_city', e.target.value)}
                />
                <Input
                  placeholder="State/Province"
                  value={form.billing_state || ''}
                  onChange={(e) => updateField('billing_state', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Postal code"
                  value={form.billing_postal_code || ''}
                  onChange={(e) => updateField('billing_postal_code', e.target.value)}
                />
                <Input
                  placeholder="Country (e.g. US)"
                  value={form.billing_country || ''}
                  onChange={(e) => updateField('billing_country', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Continue to Payment'
              )}
            </Button>
            {onSkip && (
              <Button type="button" variant="ghost" onClick={onSkip}>
                Skip
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default PayerDataForm;
