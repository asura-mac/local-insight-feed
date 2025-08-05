import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/types/database.types";
import { format } from "date-fns";
import { AlertTriangle, MapPin, Globe, Shield, Loader2, Search, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/hooks/use-alerts";
import { getAlertSeverity, getSeverityColorClass } from "@/lib/alertUtils";
import { MobileAlertTabs } from "@/components/MobileAlertTabs";
import { useState } from "react";
import React from "react";

// ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("ErrorBoundary caught an error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-4">
          <AlertTriangle className="h-12 w-12 text-dark-accent mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Something went wrong</h2>
          <p className="text-dark-text-secondary mb-4">An unexpected error occurred. Please try refreshing the page or come back later.</p>
          <Button onClick={() => window.location.reload()} className="bg-dark-accent hover:bg-dark-accent-hover text-white">
            Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Alert Card Component
const AlertCard = ({ alert }: { alert: Tables<"alerts"> }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (error) {
      return dateString;
    }
  };

  const severity = getAlertSeverity(alert);
  const severityColorClass = getSeverityColorClass(severity);

  return (
    <Card className="alert-card">
      <CardHeader className="alert-card-header">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <CardTitle className="alert-card-title">
            {alert.headline}
          </CardTitle>
          <div className="alert-card-badges">
            <Badge className={severityColorClass}>
              {severity.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs border-dark-border text-dark-text-secondary">
              {alert.district || alert.state || alert.country || 'Alert'}
            </Badge>
          </div>
        </div>
        <CardDescription className="alert-card-description">
          <span className="font-medium">{alert.source}</span>
          <span className="hidden sm:inline">•</span>
          <span>{formatDate(alert.timestamp)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="alert-card-content">{alert.description}</p>
      </CardContent>
    </Card>
  );
};

// Alert Section Component
const AlertSection = ({ 
  title, 
  icon: Icon, 
  alerts, 
  loading, 
  searchTerm, 
  onSearchChange,
  emptyMessage,
  bgColor = "bg-dark-surface",
  borderColor = "border-dark-border",
  isCollapsed = false,
  onToggleCollapse
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  alerts: Tables<"alerts">[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  emptyMessage: string;
  bgColor?: string;
  borderColor?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) => {
  return (
    <div className={`alert-section ${borderColor} ${bgColor}`}>
      {/* Section Header */}
      <div className="alert-section-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title and Badge */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-dark-accent flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <Badge variant="secondary" className="bg-dark-surface-light text-dark-text-secondary text-sm">
              {alerts.length} alerts
            </Badge>
          </div>
          
          {/* Mobile Collapse Button */}
          {onToggleCollapse && (
            <Button
              onClick={onToggleCollapse}
              variant="ghost"
              size="sm"
              className="mobile-section-toggle"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4 text-dark-text-secondary" />
              ) : (
                <ChevronUp className="h-4 w-4 text-dark-text-secondary" />
              )}
            </Button>
          )}
        </div>
        
        {/* Search Box */}
        <div className="mt-4 search-container">
          <Search className="search-icon" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Section Content */}
      {(!onToggleCollapse || !isCollapsed) && (
        <div className="alert-section-content">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-dark-border bg-dark-surface">
                  <CardHeader className="pb-3">
                    <div className="loading-skeleton-title"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="loading-skeleton-text"></div>
                      <div className="loading-skeleton-text w-4/5"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="empty-state">
              <AlertTriangle className="empty-state-icon" />
              <h3 className="empty-state-title">No alerts found</h3>
              <p className="empty-state-description">{emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Alerts() {
  const {
    allAlerts,
    userLocation,
    loading,
    loadingLocation,
    regionalSearch,
    nationalSearch,
    internationalSearch,
    filteredRegionalAlerts,
    filteredNationalAlerts,
    filteredInternationalAlerts,
    setRegionalSearch,
    setNationalSearch,
    setInternationalSearch,
    refreshAlerts,
    refreshLocation,
  } = useAlerts();

  // Mobile state management
  const [activeMobileTab, setActiveMobileTab] = useState<'regional' | 'national' | 'international'>('regional');
  const [collapsedSections, setCollapsedSections] = useState<{
    regional: boolean;
    national: boolean;
    international: boolean;
  }>({
    regional: false,
    national: false,
    international: false,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get current alerts based on mobile tab
  const getCurrentAlerts = () => {
    switch (activeMobileTab) {
      case 'regional':
        return filteredRegionalAlerts;
      case 'national':
        return filteredNationalAlerts;
      case 'international':
        return filteredInternationalAlerts;
      default:
        return filteredRegionalAlerts;
    }
  };

  const getCurrentSearch = () => {
    switch (activeMobileTab) {
      case 'regional':
        return regionalSearch;
      case 'national':
        return nationalSearch;
      case 'international':
        return internationalSearch;
      default:
        return regionalSearch;
    }
  };

  const setCurrentSearch = (value: string) => {
    switch (activeMobileTab) {
      case 'regional':
        setRegionalSearch(value);
        break;
      case 'national':
        setNationalSearch(value);
        break;
      case 'international':
        setInternationalSearch(value);
        break;
    }
  };

  const getCurrentEmptyMessage = () => {
    switch (activeMobileTab) {
      case 'regional':
        return userLocation?.state 
          ? `No regional alerts for ${userLocation.state} at this time.`
          : "Set your location in profile to see regional alerts.";
      case 'national':
        return "No national alerts at this time.";
      case 'international':
        return "No international alerts at this time.";
      default:
        return "No alerts found.";
    }
  };

  const getCurrentSectionConfig = () => {
    switch (activeMobileTab) {
      case 'regional':
        return {
          title: "Regional Alerts",
          icon: MapPin,
          bgColor: "bg-gradient-to-br from-red-900/20 to-red-800/10",
          borderColor: "border-red-800/30",
        };
      case 'national':
        return {
          title: "National Alerts",
          icon: Shield,
          bgColor: "bg-gradient-to-br from-orange-900/20 to-orange-800/10",
          borderColor: "border-orange-800/30",
        };
      case 'international':
        return {
          title: "International Alerts",
          icon: Globe,
          bgColor: "bg-gradient-to-br from-blue-900/20 to-blue-800/10",
          borderColor: "border-blue-800/30",
        };
      default:
        return {
          title: "Regional Alerts",
          icon: MapPin,
          bgColor: "bg-gradient-to-br from-red-900/20 to-red-800/10",
          borderColor: "border-red-800/30",
        };
    }
  };

  return (
    <Layout>
      <div className="container-responsive py-6 max-w-7xl">
        <ErrorBoundary>
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <h1 className="responsive-heading mb-2">Emergency Alerts</h1>
              <p className="responsive-subheading">
                Stay informed with real-time alerts from your region, nation, and around the world
              </p>
              {userLocation?.state && (
                <p className="text-sm text-dark-text-muted mt-1">
                  Your location: {userLocation.state}, {userLocation.country}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {(loading || loadingLocation) && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-dark-accent" />
                  <span className="text-dark-text-secondary text-sm">Loading...</span>
                </div>
              )}
              <Button
                onClick={refreshAlerts}
                disabled={loading}
                variant="outline"
                size="sm"
                className="border-dark-border text-gray-900 hover:bg-dark-surface-light transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <MobileAlertTabs
            activeTab={activeMobileTab}
            onTabChange={setActiveMobileTab}
            regionalCount={filteredRegionalAlerts.length}
            nationalCount={filteredNationalAlerts.length}
            internationalCount={filteredInternationalAlerts.length}
          />

          {/* Desktop Layout - Three columns */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {/* Regional Alerts Section */}
            <div className="min-w-0">
              <AlertSection
                title="Regional Alerts"
                icon={MapPin}
                alerts={filteredRegionalAlerts}
                loading={loading}
                searchTerm={regionalSearch}
                onSearchChange={setRegionalSearch}
                emptyMessage={
                  userLocation?.state 
                    ? `No regional alerts for ${userLocation.state} at this time.`
                    : "Set your location in profile to see regional alerts."
                }
                bgColor="bg-gradient-to-br from-red-900/20 to-red-800/10"
                borderColor="border-red-800/30"
              />
            </div>

            {/* National Alerts Section */}
            <div className="min-w-0">
              <AlertSection
                title="National Alerts"
                icon={Shield}
                alerts={filteredNationalAlerts}
                loading={loading}
                searchTerm={nationalSearch}
                onSearchChange={setNationalSearch}
                emptyMessage="No national alerts at this time."
                bgColor="bg-gradient-to-br from-orange-900/20 to-orange-800/10"
                borderColor="border-orange-800/30"
              />
            </div>

            {/* International Alerts Section */}
            <div className="min-w-0">
              <AlertSection
                title="International Alerts"
                icon={Globe}
                alerts={filteredInternationalAlerts}
                loading={loading}
                searchTerm={internationalSearch}
                onSearchChange={setInternationalSearch}
                emptyMessage="No international alerts at this time."
                bgColor="bg-gradient-to-br from-blue-900/20 to-blue-800/10"
                borderColor="border-blue-800/30"
              />
            </div>
          </div>

          {/* Mobile Layout - Single section based on active tab */}
          <div className="lg:hidden">
            <AlertSection
              title={getCurrentSectionConfig().title}
              icon={getCurrentSectionConfig().icon}
              alerts={getCurrentAlerts()}
              loading={loading}
              searchTerm={getCurrentSearch()}
              onSearchChange={setCurrentSearch}
              emptyMessage={getCurrentEmptyMessage()}
              bgColor={getCurrentSectionConfig().bgColor}
              borderColor={getCurrentSectionConfig().borderColor}
            />
          </div>

          {/* Alert Statistics */}
          {!loading && allAlerts.length > 0 && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-dark-surface rounded-lg border border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Statistics</h3>
              <div className="stats-grid">
                <div className="stats-card bg-dark-surface-light">
                  <div className="stats-number text-dark-accent">{allAlerts.length}</div>
                  <div className="stats-label">Total Alerts</div>
                </div>
                <div className="stats-card bg-red-900/20">
                  <div className="stats-number text-red-400">{filteredRegionalAlerts.length}</div>
                  <div className="stats-label">Regional</div>
                </div>
                <div className="stats-card bg-orange-900/20">
                  <div className="stats-number text-orange-400">{filteredNationalAlerts.length}</div>
                  <div className="stats-label">National</div>
                </div>
                <div className="stats-card bg-blue-900/20">
                  <div className="stats-number text-blue-400">{filteredInternationalAlerts.length}</div>
                  <div className="stats-label">International</div>
                </div>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
