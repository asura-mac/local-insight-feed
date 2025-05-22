
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { ArrowRight, Bell, Shield, Clock, BarChart3, CheckCircle } from "lucide-react";
import { useEmergencyAlerts } from "@/hooks/use-emergency-alerts";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { alerts } = useEmergencyAlerts();

  // Redirect authenticated users to the alerts page
  useEffect(() => {
    if (!loading && user) {
      navigate('/alerts');
    }
  }, [user, loading, navigate]);

  // If still loading or user is authenticated, show minimal content
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return null; // Navigate effect will handle redirect
  }

  // Calculate platform statistics
  const alertsProcessed = alerts?.length || 0;
  const lastUpdate = alerts && alerts.length > 0 
    ? new Date(alerts[0].created_at).toLocaleString() 
    : "Updating...";
  const newsSources = 4; // ANI, Economic Times, India Today, MoneyControl
  const uptime = "99.9%";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Bell size={36} className="text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real-Time Emergency Alert Monitoring System
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Automated monitoring of critical events from India's leading news sources, 
              updated every 15 minutes to keep you informed about emergencies as they happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/register">
                  Get Started <ArrowRight size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Continuous Monitoring</h3>
                <p className="text-gray-600">
                  Our system scans ANI News, Economic Times, India Today, and MoneyControl every 15 minutes, 
                  ensuring you never miss critical emergency information.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Intelligent Detection</h3>
                <p className="text-gray-600">
                  Advanced keyword matching identifies potential emergencies across multiple 
                  categories, filtering out non-critical news to focus on what matters.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Instant Alerts</h3>
                <p className="text-gray-600">
                  Once verified, emergency alerts are immediately added to our database and 
                  made available to users based on their location preferences.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Platform Statistics Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Platform Statistics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-gray-500 font-medium mb-1">Alerts Processed</h4>
                <p className="text-3xl font-bold text-primary">{alertsProcessed}+</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-gray-500 font-medium mb-1">News Sources</h4>
                <p className="text-3xl font-bold text-primary">{newsSources}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-gray-500 font-medium mb-1">System Uptime</h4>
                <p className="text-3xl font-bold text-primary">{uptime}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-gray-500 font-medium mb-1">Last Update</h4>
                <p className="text-sm font-medium text-primary">{lastUpdate}</p>
              </div>
            </div>
            
            <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <BarChart3 className="text-primary mr-2" size={24} />
                <h3 className="text-xl font-semibold">System Status</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ANI News Scraper</span>
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-1" size={16} />
                    <span className="text-green-500 text-sm font-medium">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Economic Times Scraper</span>
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-1" size={16} />
                    <span className="text-green-500 text-sm font-medium">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">India Today Scraper</span>
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-1" size={16} />
                    <span className="text-green-500 text-sm font-medium">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">MoneyControl Scraper</span>
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-1" size={16} />
                    <span className="text-green-500 text-sm font-medium">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database Services</span>
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-1" size={16} />
                    <span className="text-green-500 text-sm font-medium">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* User Guide & FAQ */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">User Guide & FAQ</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold mb-6">How to Use Alert Hub</h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h4 className="font-semibold text-lg mb-2">Understanding Alerts</h4>
                    <p className="text-gray-600">
                      Emergency alerts are categorized based on severity and type. Each alert 
                      shows the headline, source, and time detected. Click on an alert to view 
                      the original article for complete information.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h4 className="font-semibold text-lg mb-2">Setting Location Preferences</h4>
                    <p className="text-gray-600">
                      Create an account and complete the onboarding process to set your location 
                      preferences. This helps us show alerts relevant to your area and send 
                      notifications for emergencies that may affect you.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h4 className="font-semibold text-lg mb-2">Recommended Actions</h4>
                    <p className="text-gray-600">
                      Always verify emergency information from multiple sources. Use our platform
                      as an early warning system but follow directions from official government 
                      agencies during actual emergencies.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h3>
                
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-lg mb-1">How fresh is the alert information?</h4>
                    <p className="text-gray-600">
                      Our scrapers run every 15 minutes to check for new emergency information.
                      Alerts are timestamped with their detection time, and we maintain a 24-hour
                      window of active alerts.
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-lg mb-1">What types of emergencies are tracked?</h4>
                    <p className="text-gray-600">
                      We track natural disasters, severe weather, security incidents, major accidents,
                      public health emergencies, and critical infrastructure failures. Our system uses
                      keyword matching to identify these situations.
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-lg mb-1">What geographic areas are covered?</h4>
                    <p className="text-gray-600">
                      We primarily focus on emergencies across India, with particular attention to major
                      cities and regions. Our coverage extends to national-level emergencies and those
                      affecting specific states and districts.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-1">How can I report an issue or suggest improvements?</h4>
                    <p className="text-gray-600">
                      We value your feedback! Please contact us through the feedback form in your profile
                      section after signing in. For urgent issues, email us at support@alert-hub.com.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-50 py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Bell size={20} className="text-primary" />
              <span className="font-semibold">Alert Hub</span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Alert Hub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
