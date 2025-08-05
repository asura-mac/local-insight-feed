import { Tables } from "@/types/database.types";
import { 
  REGIONAL_EMERGENCY_KEYWORDS, 
  NATIONAL_EMERGENCY_KEYWORDS, 
  INTERNATIONAL_EMERGENCY_KEYWORDS,
  EXCLUSION_KEYWORDS 
} from "./constants";

export interface UserLocation {
  country: string | null;
  state: string | null;
  district: string | null;
}

export interface AlertFilters {
  regionalSearch: string;
  nationalSearch: string;
  internationalSearch: string;
}

export interface CategorizedAlerts {
  regional: Tables<"alerts">[];
  national: Tables<"alerts">[];
  international: Tables<"alerts">[];
}

/**
 * Filter alerts by regional keywords based on user's state
 */
export const filterRegionalAlerts = (
  alerts: Tables<"alerts">[], 
  userLocation: UserLocation | null
): Tables<"alerts">[] => {
  if (!userLocation?.state) {
    return [];
  }

  const stateKeywords = REGIONAL_EMERGENCY_KEYWORDS[userLocation.state as keyof typeof REGIONAL_EMERGENCY_KEYWORDS];
  if (!stateKeywords) {
    return [];
  }

  return alerts.filter(alert => {
    const content = `${alert.headline} ${alert.description}`.toLowerCase();
    
    // Check if content contains any exclusion keywords
    const hasExclusionKeywords = EXCLUSION_KEYWORDS.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
    
    if (hasExclusionKeywords) {
      return false;
    }

    // Check if content contains any state-specific keywords
    return stateKeywords.some(keyword => content.includes(keyword.toLowerCase()));
  });
};

/**
 * Filter alerts by national keywords
 */
export const filterNationalAlerts = (alerts: Tables<"alerts">[]): Tables<"alerts">[] => {
  return alerts.filter(alert => {
    const content = `${alert.headline} ${alert.description}`.toLowerCase();
    
    // Check if content contains any exclusion keywords
    const hasExclusionKeywords = EXCLUSION_KEYWORDS.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
    
    if (hasExclusionKeywords) {
      return false;
    }

    // Check if content contains any national keywords
    return NATIONAL_EMERGENCY_KEYWORDS.some(keyword => content.includes(keyword.toLowerCase()));
  });
};

/**
 * Filter alerts by international keywords
 */
export const filterInternationalAlerts = (alerts: Tables<"alerts">[]): Tables<"alerts">[] => {
  return alerts.filter(alert => {
    const content = `${alert.headline} ${alert.description}`.toLowerCase();
    
    // Check if content contains any exclusion keywords
    const hasExclusionKeywords = EXCLUSION_KEYWORDS.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
    
    if (hasExclusionKeywords) {
      return false;
    }

    // Check if content contains any international keywords
    return INTERNATIONAL_EMERGENCY_KEYWORDS.some(keyword => content.includes(keyword.toLowerCase()));
  });
};

/**
 * Filter alerts by search term
 */
export const filterAlertsBySearch = (
  alerts: Tables<"alerts">[], 
  searchTerm: string
): Tables<"alerts">[] => {
  if (!searchTerm.trim()) {
    return alerts;
  }

  const term = searchTerm.toLowerCase();
  return alerts.filter(alert =>
    alert.headline?.toLowerCase().includes(term) ||
    alert.description?.toLowerCase().includes(term) ||
    alert.source?.toLowerCase().includes(term) ||
    alert.state?.toLowerCase().includes(term) ||
    alert.country?.toLowerCase().includes(term)
  );
};

/**
 * Categorize all alerts into regional, national, and international
 */
export const categorizeAlerts = (
  alerts: Tables<"alerts">[], 
  userLocation: UserLocation | null
): CategorizedAlerts => {
  const regional = filterRegionalAlerts(alerts, userLocation);
  const national = filterNationalAlerts(alerts);
  const international = filterInternationalAlerts(alerts);

  return {
    regional,
    national,
    international
  };
};

/**
 * Get severity level for an alert based on keywords
 */
export const getAlertSeverity = (alert: Tables<"alerts">): 'high' | 'medium' | 'low' => {
  const content = `${alert.headline} ${alert.description}`.toLowerCase();
  
  // High severity keywords
  const highSeverityKeywords = ['war', 'attack', 'bomb', 'explosion', 'terror', 'nuclear', 'missile'];
  if (highSeverityKeywords.some(keyword => content.includes(keyword))) {
    return 'high';
  }
  
  // Medium severity keywords
  const mediumSeverityKeywords = ['alert', 'security', 'threat', 'violation', 'tension', 'conflict'];
  if (mediumSeverityKeywords.some(keyword => content.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
};

/**
 * Get color class for severity badge
 */
export const getSeverityColorClass = (severity: 'high' | 'medium' | 'low'): string => {
  switch (severity) {
    case 'high':
      return 'bg-red-900 text-red-300 border-red-700';
    case 'medium':
      return 'bg-orange-900 text-orange-300 border-orange-700';
    case 'low':
      return 'bg-blue-900 text-blue-300 border-blue-700';
    default:
      return 'bg-gray-900 text-gray-300 border-gray-700';
  }
};

/**
 * Sort alerts by timestamp (newest first)
 */
export const sortAlertsByDate = (alerts: Tables<"alerts">[]): Tables<"alerts">[] => {
  return [...alerts].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });
};

/**
 * Get unique sources from alerts
 */
export const getUniqueSources = (alerts: Tables<"alerts">[]): string[] => {
  const sources = alerts.map(alert => alert.source).filter(Boolean);
  return [...new Set(sources)];
};

/**
 * Get alert statistics
 */
export const getAlertStats = (alerts: Tables<"alerts">[]): {
  total: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  sources: number;
} => {
  const severityCounts = alerts.reduce((acc, alert) => {
    const severity = getAlertSeverity(alert);
    acc[severity]++;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  return {
    total: alerts.length,
    highSeverity: severityCounts.high,
    mediumSeverity: severityCounts.medium,
    lowSeverity: severityCounts.low,
    sources: getUniqueSources(alerts).length
  };
}; 