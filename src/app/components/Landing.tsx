import { ArrowRight, Zap, Shield, Webhook, BarChart3, CheckCircle2, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Header } from "./Header";
import { useState, useEffect } from "react";

const TypingEffect = ({ words, speed = 100, delayBetween = 1000 }: { words: string[]; speed?: number; delayBetween?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && charIndex < currentWord.length) {
      timer = setTimeout(() => {
        setDisplayText(currentWord.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, speed);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setDisplayText(currentWord.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, speed / 2);
    } else if (!isDeleting && charIndex === currentWord.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, delayBetween);
    } else if (isDeleting && charIndex === 0) {
      setWordIndex((wordIndex + 1) % words.length);
      setIsDeleting(false);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, words, speed, delayBetween]);

  return <span className="text-primary">{displayText}</span>;
};

export function Landing() {
  const features = [
    {
      icon: Zap,
      title: "Instant USDC & XLM Settlement",
      description: "Payments settle in 2-5 seconds on the Stellar blockchain. No waiting days for funds.",
    },
    {
      icon: Shield,
      title: "No Chargebacks",
      description: "Blockchain payments are final. No fraudulent chargebacks or payment disputes.",
    },
    {
      icon: Coins,
      title: "Stellar-Powered Payments",
      description: "Built on Stellar's fast, low-cost network. Accept USDC & XLM with minimal fees.",
    },
    {
      icon: CheckCircle2,
      title: "Simple Redirect Checkout",
      description: "Hosted payment page with QR codes. Your customers scan and pay in seconds.",
    },
    {
      icon: Webhook,
      title: "Webhooks & Dashboard",
      description: "Real-time payment notifications and a clean dashboard to track all transactions.",
    },
    {
      icon: BarChart3,
      title: "Developer-Friendly API",
      description: " API's to Integrate in minutes with clear documentation.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Merchant creates payment",
      description: "Your backend calls ChainPe API to create a payment session",
    },
    {
      number: "02",
      title: "Customer pays via wallet",
      description: "Customer scans QR code with Stellar wallet (Freighter, Lobstr, etc.)",
    },
    {
      number: "03",
      title: "Backend confirms on-chain",
      description: "Dari monitors Stellar blockchain and detects the payment",
    },
    {
      number: "04",
      title: "Merchant gets paid instantly",
      description: "Webhook notification sent, funds settled in your Stellar account",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 border border-primary/30 rounded-full">
            <span className="text-primary text-sm">Accept Stablecoin Payments</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl mb-6 tracking-tight">
            Accept <TypingEffect words={["USDC", "XLM"]} speed={80} delayBetween={1500} /> Payments
            <br />
            <span className="text-primary">Instantly on Stellar</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            A Stripe-like checkout for stablecoins. No chargebacks. Instant settlement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8"
              onClick={() => window.location.href = '#/register'}
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() => window.location.href = '#/login'}
            >
              Sign In
            </Button>
          </div>

          {/* Grid Pattern Decoration */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 border border-border rounded-lg opacity-20" 
                 style={{
                   backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #27272A 19px, #27272A 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #27272A 19px, #27272A 20px)',
                   backgroundSize: '20px 20px'
                 }}
            />
            <div className="relative bg-card border border-border rounded-lg p-8 md:p-12">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl md:text-4xl mb-2">2-5s</div>
                  <div className="text-sm text-muted-foreground">Settlement Time</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl mb-2">$0.01</div>
                  <div className="text-sm text-muted-foreground">Network Fee</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Final Payments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4">Built for the future of payments</h2>
            <p className="text-xl text-muted-foreground">Everything you need to accept stablecoin payments with USDC & XLM</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground">Four simple steps to accept USDC and XLM payments</p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-2xl text-primary font-bold">{step.number}</span>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Stack */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl mb-12">Powered by the best</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 text-muted-foreground">
            <div className="text-2xl font-bold">Stellar</div>
            <div className="text-2xl font-bold">USDC</div>
            <div className="text-2xl font-bold">XLM</div>
            <div className="text-2xl font-bold">Freighter</div>
            <div className="text-2xl font-bold">Soroban</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 bg-primary/5 border-primary/20 text-center">
            <h2 className="text-3xl md:text-4xl mb-4">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start accepting USDC and XLM payments in minutes
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8"
              onClick={() => window.location.href = '#/register'}
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold">ChainPe</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#docs" className="hover:text-foreground transition-colors">Docs</a>
              <a href="#github" className="hover:text-foreground transition-colors">GitHub</a>
              <a href="#terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}