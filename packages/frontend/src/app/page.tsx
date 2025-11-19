import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">FlowXchange</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              How It Works
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          The Reverse-Auction Marketplace
          <br />
          <span className="text-purple-600">for FX Affiliates & Brokers</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect anonymously, negotiate deals, and build profitable partnerships.
          Affiliates post deals, brokers compete with their best offers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register?role=affiliate">
            <Button size="lg" className="w-full sm:w-auto">
              I'm an Affiliate <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/register?role=broker">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              I'm a Broker
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why FlowXchange?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Shield className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Anonymous Until Deal</h3>
            <p className="text-gray-600">
              Identities remain hidden during negotiation. Only revealed after acceptance.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Zap className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-Time Bidding</h3>
            <p className="text-gray-600">
              Instant notifications and live updates. Negotiate in real-time with counter-offers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Best Deals Win</h3>
            <p className="text-gray-600">
              Reverse auction ensures affiliates get the most competitive offers from brokers.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Affiliate Posts Deal</h3>
                <p className="text-gray-600">
                  Create an anonymized deal request with your terms, volume, and requirements.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Brokers Bid</h3>
                <p className="text-gray-600">
                  Verified brokers review deals and submit competitive offers with their best terms.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Negotiate & Accept</h3>
                <p className="text-gray-600">
                  Counter-offers fly back and forth. Once accepted, identities are revealed.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect & Partner</h3>
                <p className="text-gray-600">
                  Direct messaging opens up. Build your partnership and start trading.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join FlowXchange today and discover better deals.
        </p>
        <Link href="/register">
          <Button size="lg">
            Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 FlowXchange. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
