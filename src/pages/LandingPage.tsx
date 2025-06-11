import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Shield, Globe, Zap } from 'lucide-react';

const features = [
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Real-Time Monitoring",
    description: "24/7 monitoring of trusted news sources for critical updates and emergency alerts."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verified Sources",
    description: "Information gathered from multiple trusted sources to ensure accuracy and reliability."
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Global Coverage",
    description: "Comprehensive coverage of emergency situations and conflicts worldwide."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Notifications",
    description: "Receive immediate alerts on your device through our PWA-enabled platform."
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Stay Alert, Stay Prepared
              <span className="block text-red-600">Emergency News Monitoring</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get real-time alerts about critical situations and emergency updates from verified sources worldwide.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/alerts"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                View Alerts
              </Link>
              <button
                onClick={() => window.Notification?.requestPermission()}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Enable Notifications
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive emergency monitoring with instant notifications
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-red-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Start Receiving Critical Alerts Today
          </h2>
          <Link
            to="/alerts"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 