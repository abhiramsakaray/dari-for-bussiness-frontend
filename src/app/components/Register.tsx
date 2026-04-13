import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ArrowLeft } from "lucide-react";
import { chainpeService } from "../../services/chainpe";
import { apiClient } from "../../lib/api-client";
import { toast } from "sonner";

export function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    merchant_category: "individual",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await chainpeService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        merchant_category: formData.merchant_category,
      });
      
      // Store the access token and API key
      localStorage.setItem('merchant_token', response.access_token);
      localStorage.setItem('api_key', response.api_key);
      localStorage.setItem('merchant_email', formData.email);
      localStorage.setItem('merchant_name', formData.name);
      
      // Store onboarding status (new registrations always need onboarding)
      localStorage.setItem('onboarding_completed', 'false');
      localStorage.setItem('onboarding_step', '1');
      if (response.merchant_id) {
        localStorage.setItem('merchant_id', response.merchant_id);
      }
      
      apiClient.setApiKey(response.api_key);
      
      toast.success("Account created successfully!");
      
      // Always redirect to onboarding for new registrations
      window.location.href = '#/onboarding';
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Register Card */}
        <Card className="p-8 bg-card border-primary/30">
          <div className="mb-6">
            <h1 className="text-3xl mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Start accepting USDC payments today
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="My Store"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                className="mt-1.5 bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="merchant@store.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                className="mt-1.5 bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
                className="mt-1.5 bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="category">Business Type</Label>
              <Select
                value={formData.merchant_category}
                onValueChange={(value) => updateField('merchant_category', value)}
              >
                <SelectTrigger className="mt-1.5 bg-input-background">
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
              <p className="text-xs text-muted-foreground mt-1">
                Help us tailor our platform to your needs
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <a href="#/login" className="text-primary hover:underline">
              Login
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}