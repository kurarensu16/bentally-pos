import { Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Menu,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import bentallyLogo from '../../assets/images/Bentally Logo1.png'
import dashboardImg from '../../assets/images/dashboard.png'
import menuImg from '../../assets/images/menu.png'
import posImg from '../../assets/images/pos.png'
import ordersImg from '../../assets/images/orders.png'
import reportsimg1 from '../../assets/images/reports1.png'
import reportsimg2 from '../../assets/images/reports2.png'

export function LandingPage() {
  const heroSlides = [
    { src: dashboardImg, label: 'Dashboard Overview' },
    { src: posImg, label: 'POS Interface' },
    { src: ordersImg, label: 'Order Tracking' },
    { src: menuImg, label: 'Menu Management' },
    { src: reportsimg1, label: 'Reports & Analytics' },
    { src: reportsimg2, label: 'Reports & Analytics' },
    
  ]
  const [slideIndex, setSlideIndex] = useState(0)
  const nextSlide = () => setSlideIndex((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(id)
  }, [heroSlides.length])
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img
                src={bentallyLogo}
                alt="Bentally POS logo"
                className="h-[92px] w-[92px]"
              />
              <span className="text-2xl font-bold text-gray-900">Bentally POS</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-primary-600 transition-colors">Benefits</a>
              <Link 
                to="/login" 
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-white">
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-48 -left-48 w-[650px] h-[650px] rounded-full bg-primary-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[550px] h-[550px] rounded-full bg-emerald-400/15 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Modern POS System
              <span className="block text-[#5dd6a3]">Built for Small Filipino Restaurants</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
            BenTally POS is the easy-to-use system that turns every Benta (sale) and accurate Tally (count) into the precise data your business needs to thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register"
                className="px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              {/* <button className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition-all border-2 border-primary-600 font-semibold text-lg">
                Watch Demo
              </button> */}
            </div>
          </div>

          {/* Hero Slider */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-2xl p-4 sm:p-8 border border-white/20 relative overflow-hidden">
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary-600 rounded-full p-2 shadow focus:outline-none"
                aria-label="Previous preview"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <img
                src={heroSlides[slideIndex].src}
                alt={heroSlides[slideIndex].label}
                className="rounded-xl w-full object-cover border border-gray-100"
              />
              <p className="text-sm text-gray-500 text-center mt-4">
                {heroSlides[slideIndex].label}
              </p>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary-600 rounded-full p-2 shadow focus:outline-none"
                aria-label="Next preview"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything Small Businesses Need - Completely Free
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for small restaurants - all free forever. No complex setup, no expensive hardware, no subscriptions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Menu className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Menu Management</h3>
              <p className="text-gray-600">
                Easily create, update, and organize your menu items. Set daily specials and manage inventory in real-time.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Processing</h3>
              <p className="text-gray-600">
                Process orders quickly with our intuitive interface. Support for dine-in, takeout, and delivery orders.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
              <p className="text-gray-600">
                Get insights into your business with detailed reports on sales, popular items, and customer trends.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Table Management</h3>
              <p className="text-gray-600">
                Visual table grid to manage seating, track orders per table, and optimize your floor plan.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">
                All changes sync instantly across all devices. No delays, no confusion, just seamless operations.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Configuration</h3>
              <p className="text-gray-600">
                Customize your POS system to match your restaurant's needs. Simple settings, powerful results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 text-white">
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full bg-primary-500/15 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[550px] h-[550px] rounded-full bg-emerald-400/10 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Small Businesses Choose Bentally POS?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Completely free, simple, and powerful - everything small restaurants need to compete with bigger establishments, without the cost.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-primary-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Fast & Reliable</h3>
                    <p className="text-white/70">Lightning-fast order processing keeps your customers happy and your staff efficient.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-primary-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Offline Capable</h3>
                    <p className="text-white/70">Continue taking orders even when the internet is down. Your data syncs automatically when connection is restored.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-primary-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Mobile Friendly</h3>
                    <p className="text-white/70">Works seamlessly on tablets, phones, and desktops. Install as a PWA for app-like experience.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-primary-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">100% Free Forever</h3>
                    <p className="text-white/70">No subscriptions, no hidden fees, no credit card required. Get enterprise-level features completely free - forever.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-primary-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Secure & Private</h3>
                    <p className="text-white/70">Your data is encrypted and secure. We take privacy seriously and comply with industry standards.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 rounded-2xl shadow-xl p-8 border border-white/10">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales Today</p>
                    <p className="text-2xl font-bold text-gray-900">₱12,450</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Orders</p>
                    <p className="text-xl font-bold text-gray-900">127</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Avg. Order</p>
                    <p className="text-xl font-bold text-gray-900">₱98</p>
                  </div>
                </div>

                <div className="p-4 bg-primary-600 rounded-lg text-white">
                  <p className="text-sm opacity-90">Most Popular Item</p>
                  <p className="text-xl font-bold">Grilled Salmon</p>
                  <p className="text-sm opacity-75 mt-1">45 orders today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Using Your Free POS System Today
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join hundreds of small businesses using Bentally POS - completely free forever. No credit card, no subscriptions, no hidden fees. Get started in seconds.
          </p>
          <Link 
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart className="h-6 w-6 text-primary-400" />
                <span className="text-xl font-bold text-white">Bentally POS</span>
              </div>
              <p className="text-sm text-gray-400">
                Completely free point-of-sale system designed specifically for small businesses and restaurants to streamline operations and grow their business - no cost, forever.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#benefits" className="hover:text-primary-400 transition-colors">Benefits</a></li>
                <li><Link to="/login" className="hover:text-primary-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Bentally POS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

