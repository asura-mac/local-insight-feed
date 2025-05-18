
import React, { useEffect, useState } from "react";
import { useEmergencyAlerts, EmergencyAlert } from "@/hooks/use-emergency-alerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function EmergencyAlertCard({ alert }: { alert: EmergencyAlert }) {
  const [timeElapsed, setTimeElapsed] = useState<string>("");
  
  useEffect(() => {
    // Calculate initial time display
    updateTimeDisplay();
    
    // Update time display every minute
    const interval = setInterval(updateTimeDisplay, 60000);
    return () => clearInterval(interval);
  }, [alert.created_at]);
  
  function updateTimeDisplay() {
    const alertTime = new Date(alert.created_at);
    const now = new Date();
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      setTimeElapsed(`${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`);
    } else if (diffMins > 0) {
      setTimeElapsed(`${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`);
    } else {
      setTimeElapsed('Just now');
    }
  }
  
  // Check if alert is fresh (less than 30 minutes old)
  const isFresh = () => {
    const alertTime = new Date(alert.created_at);
    const now = new Date();
    return (now.getTime() - alertTime.getTime()) < 30 * 60 * 1000; // 30 minutes
  };

  return (
    <Card className={`mb-4 border-l-4 ${isFresh() ? 'border-l-red-500 bg-red-900/10' : 'border-l-yellow-600 bg-[#222]'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-start gap-2">
          <AlertTriangle className={`h-5 w-5 ${isFresh() ? 'text-red-500' : 'text-yellow-500'} flex-shrink-0`} />
          <a 
            href={alert.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline text-gray-100 group flex items-start"
          >
            {alert.title}
            <ExternalLink className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-70 text-gray-400" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {alert.matched_keywords.map((keyword, index) => (
            <Badge key={index} variant="outline" className={isFresh() ? "bg-red-900/30 text-red-300 border-red-700/50" : "bg-yellow-900/20 text-yellow-200 border-yellow-700/30"}>
              {keyword}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-auto flex items-center">
            <Clock className="h-3 w-3 mr-1" /> {timeElapsed}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmergencyAlertsList() {
  const { alerts, loading, error, refreshAlerts } = useEmergencyAlerts();
  const { toast } = useToast();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Auto-refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshAlerts();
      setLastRefreshed(new Date());
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    
    return () => clearInterval(refreshInterval);
  }, [refreshAlerts]);
  
  // Handle manual refresh with cooldown
  const handleManualRefresh = () => {
    const now = new Date();
    const timeSinceLastRefresh = now.getTime() - lastRefreshed.getTime();
    
    // Prevent refreshing more than once every 30 seconds
    if (timeSinceLastRefresh < 30 * 1000) {
      toast({
        title: "Please Wait",
        description: "You can refresh alerts again in a few seconds.",
        variant: "default",
      });
      return;
    }
    
    refreshAlerts();
    setLastRefreshed(now);
    toast({
      title: "Refreshed",
      description: "Alert list has been updated.",
    });
  };
  
  // Filter out alerts older than 6 hours
  const filteredAlerts = alerts.filter(alert => {
    const alertTime = new Date(alert.created_at);
    const now = new Date();
    return (now.getTime() - alertTime.getTime()) < 6 * 60 * 60 * 1000; // 6 hours
  });

  if (error) {
    return (
      <Card className="mb-4 border-red-700 bg-red-900/10">
        <CardContent className="pt-4">
          <div className="text-red-400 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Error: {error}
          </div>
          <Button 
            onClick={handleManualRefresh}
            className="mt-4 bg-red-800 hover:bg-red-700"
            size="sm"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4 bg-[#222] border-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16 bg-gray-700" />
                <Skeleton className="h-4 w-16 bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (filteredAlerts.length === 0) {
    return (
      <Card className="mb-4 bg-[#222] border-gray-800">
        <CardContent className="pt-4 text-center text-gray-400">
          No emergency alerts found in the last 6 hours.
          <div className="mt-2">
            <Button 
              onClick={handleManualRefresh}
              variant="outline"
              size="sm"
              className="text-gray-300 border-gray-700"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-400">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </span>
        <Button 
          onClick={handleManualRefresh} 
          variant="outline" 
          size="sm"
          className="text-gray-300 border-gray-700"
        >
          Refresh
        </Button>
      </div>
      {filteredAlerts.map((alert) => (
        <EmergencyAlertCard key={alert.id} alert={alert} />
      ))}
    </>
  );
}

export function EmergencyAlertsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-white">Emergency Alerts</h2>
        <Badge className="ml-2 bg-red-500">LIVE</Badge>
      </div>
      <p className="text-gray-400">
        Real-time emergency alerts from ANI News, updated every 15 minutes
      </p>
      <EmergencyAlertsList />
    </div>
  );
}

export default EmergencyAlertsSection;
