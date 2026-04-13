import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { ArrowLeft, Building2, Users } from "lucide-react";
import { chainpeService } from "../../services/chainpe";
import { teamAuthService } from "../../services/teamAuth.service";
import { apiClient } from "../../lib/api-client";
import { toast } from "sonner";

type LoginType = 'merchant' | 'team';

export function Login() {
  const [loginType, setLoginType] = useState<LoginType>('merchant');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (loginType === 'merchant') {
        // Merchant login
        const response = await chainpeService.login({ email, password });
        
        // Store the access token and API key
        localStorage.setItem('merchant_token', response.access_token);
        localStorage.setItem('api_key', response.api_key);
        localStorage.setItem('merchant_email', email);
        
        // Store onboarding status
        if (response.onboarding_completed !== undefined) {
          localStorage.setItem('onboarding_completed', String(response.onboarding_completed));
        }
        if (response.onboarding_step !== undefined) {
          localStorage.setItem('onboarding_step', String(response.onboarding_step));
        }
        if (response.merchant_id) {
          localStorage.setItem('merchant_id', response.merchant_id);
        }
        if (response.name) {
          localStorage.setItem('merchant_name', response.name);
        }
        
        apiClient.setApiKey(response.api_key);
        
        toast.success("Login successful!");
        
        // Check if admin
        if (email.includes('admin')) {
          window.location.href = '#/admin';
          return;
        }
        
        // Redirect based on onboarding status
        if (response.onboarding_completed === false) {
          window.location.href = '#/onboarding';
        } else {
          window.location.href = '#/dashboard';
        }
      } else {
        // Team member login
        const response = await teamAuthService.login({ email, password });
        
        toast.success("Login successful!");
        
        // Redirect to regular dashboard (same as merchants, but with role-based permissions)
        window.location.href = '#/dashboard';
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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

        {/* Login Card */}
        <Card className="p-8 bg-card border-primary/30">
          {/* Login Type Selector */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setLoginType('merchant')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
                  loginType === 'merchant'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Merchant
              </button>
              <button
                type="button"
                onClick={() => setLoginType('team')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
                  loginType === 'team'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="h-4 w-4" />
                Team Member
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl mb-2">Login</h1>
            <p className="text-muted-foreground">
              {loginType === 'merchant' 
                ? 'Access your merchant dashboard' 
                : 'Access your team member dashboard'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={loginType === 'merchant' ? 'merchant@store.com' : 'member@company.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 bg-input-background"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {loginType === 'merchant' ? (
              <>
                <span className="text-muted-foreground">Don't have an account? </span>
                <a href="#/register" className="text-primary hover:underline">
                  Register
                </a>
              </>
            ) : (
              <span className="text-muted-foreground">
                Contact your merchant owner to get access
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}