import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Shield, Globe, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

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
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-dark-bg to-dark-surface">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-dark-text-primary mb-6">
                Stay Alert, Stay Prepared
                <span className="block text-dark-accent">Emergency News Monitoring</span>
              </h1>
              <p className="text-xl text-dark-text-secondary mb-8 max-w-2xl mx-auto">
                Get real-time alerts about critical situations and emergency updates from verified sources worldwide.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/alerts"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-dark-accent hover:bg-dark-accent-hover transition-colors shadow-lg"
                >
                  View Alerts
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-dark-text-primary mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-dark-text-secondary">
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
                  className="p-6 bg-dark-surface-light rounded-lg shadow-lg border border-dark-border hover:shadow-xl transition-all duration-300 hover:border-dark-accent/30"
                >
                  <div className="text-dark-accent mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-text-secondary">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-dark-accent to-dark-accent-hover">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              Start Receiving Critical Alerts Today
            </h2>
            <Link
              to="/alerts"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-dark-accent bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default LandingPage; 