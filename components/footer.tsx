import { TrendingUp, Twitter, Github, Linkedin } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 w-full mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        {/* Logo and Description */}
        <div className="flex-1 mb-8 md:mb-0 flex flex-col items-center md:items-start">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold">StockFlow</span>
          </div>
          <p className="text-gray-400 mb-4 max-w-md text-center md:text-left">
            Your trusted partner in building wealth through smart investing. Start your journey to financial freedom today.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="flex-1 flex flex-col items-center md:items-end">
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-center md:text-right">
            <li>
              <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2025 StockFlow. All rights reserved.</p>
      </div>
    </footer>
  )
}
