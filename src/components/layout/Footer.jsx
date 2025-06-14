import { Train, Mail, Phone, MapPin } from "lucide-react"

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-metro-600 p-2 rounded-lg">
                <Train className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">NeoMetro</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Modern, efficient, and sustainable metro transportation system connecting the city with cutting-edge
              technology and exceptional service.
            </p>
            <div className="bg-red-600 text-white text-center py-2 px-4 text-xs font-semibold rounded-lg max-w-md">
              This is a development project and not affiliated with any real metro system.
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/tickets" className="hover:text-white transition-colors">
                  Book Tickets
                </a>
              </li>
              <li>
                <a href="/metro-pass" className="hover:text-white transition-colors">
                  Metro Pass
                </a>
              </li>
              <li>
                <a href="/fares" className="hover:text-white transition-colors">
                  Fare Information
                </a>
              </li>
              <li>
                <a href="/routes" className="hover:text-white transition-colors">
                  Route Map
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91 40 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@neometro.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Hyderabad, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 NeoMetro. All rights reserved. This is a development project.</p>
        </div>
      </div>
    </footer>
  )
}
