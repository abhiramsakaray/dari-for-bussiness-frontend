import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { onboardingService, BusinessDetailsInput } from '../../../services/onboarding.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { ArrowRight, Building2 } from 'lucide-react';

interface BusinessDetailsFormData {
  business_name: string;
  business_email?: string;
  country: string;
  merchant_category: string;
}

interface BusinessDetailsProps {
  onComplete: () => void;
}

export function BusinessDetails({ onComplete }: BusinessDetailsProps) {
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BusinessDetailsFormData>({
    defaultValues: {
      business_name: '',
      business_email: '',
      country: 'India',
      merchant_category: 'individual',
    },
  });

  const onSubmit = async (data: BusinessDetailsFormData) => {
    setLoading(true);
    try {
      console.log('Form data received:', data);
      
      // Ensure we have valid data
      const business_name = data.business_name?.trim();
      const country = data.country?.trim();
      const merchant_category = data.merchant_category?.trim();

      if (!business_name) {
        toast.error('Please enter your business name');
        setLoading(false);
        return;
      }
      
      if (!country) {
        toast.error('Please select your country');
        setLoading(false);
        return;
      }
      
      if (!merchant_category) {
        toast.error('Please select your business type');
        setLoading(false);
        return;
      }

      const input: BusinessDetailsInput = {
        business_name,
        country,
        merchant_category,
      };

      // Only include business_email if it has a value
      if (data.business_email?.trim()) {
        input.business_email = data.business_email.trim();
      }

      console.log('Submitting business details:', input);
      await onboardingService.submitBusinessDetails(input);
      toast.success('Business details saved!');
      onComplete();
    } catch (error: any) {
      console.error('Business details error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to save business details';
      console.error('Error details:', error.response?.data);
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl">Tell us about your business</CardTitle>
          <CardDescription>
            This helps us tailor Dari to your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Controller
                name="business_name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="business_name"
                    {...field}
                    placeholder="Acme Corp"
                  />
                )}
              />
              {errors.business_name && (
                <p className="text-sm text-red-500">{errors.business_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email">Business Email</Label>
              <Controller
                name="business_email"
                control={control}
                render={({ field }) => (
                  <Input
                    id="business_email"
                    type="email"
                    {...field}
                    placeholder="billing@acme.com (optional)"
                  />
                )}
              />
              {errors.business_email && (
                <p className="text-sm text-red-500">{errors.business_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                      <SelectItem value="Spain">Spain</SelectItem>
                      <SelectItem value="Italy">Italy</SelectItem>
                      <SelectItem value="Netherlands">Netherlands</SelectItem>
                      <SelectItem value="Switzerland">Switzerland</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="South Korea">South Korea</SelectItem>
                      <SelectItem value="UAE">United Arab Emirates</SelectItem>
                      <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                      <SelectItem value="South Africa">South Africa</SelectItem>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="Egypt">Egypt</SelectItem>
                      <SelectItem value="Argentina">Argentina</SelectItem>
                      <SelectItem value="Chile">Chile</SelectItem>
                      <SelectItem value="Colombia">Colombia</SelectItem>
                      <SelectItem value="Poland">Poland</SelectItem>
                      <SelectItem value="Sweden">Sweden</SelectItem>
                      <SelectItem value="Norway">Norway</SelectItem>
                      <SelectItem value="Denmark">Denmark</SelectItem>
                      <SelectItem value="Finland">Finland</SelectItem>
                      <SelectItem value="Ireland">Ireland</SelectItem>
                      <SelectItem value="New Zealand">New Zealand</SelectItem>
                      <SelectItem value="Malaysia">Malaysia</SelectItem>
                      <SelectItem value="Thailand">Thailand</SelectItem>
                      <SelectItem value="Vietnam">Vietnam</SelectItem>
                      <SelectItem value="Philippines">Philippines</SelectItem>
                      <SelectItem value="Indonesia">Indonesia</SelectItem>
                      <SelectItem value="Pakistan">Pakistan</SelectItem>
                      <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                      <SelectItem value="Turkey">Turkey</SelectItem>
                      <SelectItem value="Russia">Russia</SelectItem>
                      <SelectItem value="Ukraine">Ukraine</SelectItem>
                      <SelectItem value="Israel">Israel</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant_category">Business Type *</Label>
              <Controller
                name="merchant_category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual/Freelancer</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="small_business">Small Business</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="ngo">NGO/Non-Profit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.merchant_category && (
                <p className="text-sm text-red-500">{errors.merchant_category.message}</p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Saving...' : 'Continue'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
