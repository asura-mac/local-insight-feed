
import React from "react";
import { useEmergencyAlerts, EmergencyAlert } from "@/hooks/use-emergency-alerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function EmergencyAlertCard({ alert }: { alert: EmergencyAlert }) {
  return (
    <Card className="mb-4 border-l-4 border-l-red-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <a 
            href={alert.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {alert.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {alert.matched_keywords.map((keyword, index) => (
            <Badge key={index} variant="outline" className="bg-red-50">
              {keyword}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(alert.created_at).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmergencyAlertsList() {
  const { alerts, loading, error, refreshAlerts } = useEmergencyAlerts();

  if (error) {
    return (
      <Card className="mb-4 border-red-200">
        <CardContent className="pt-4">
          <div className="text-red-500">Error: {error}</div>
          <button 
            onClick={refreshAlerts}
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-4 text-center text-muted-foreground">
          No emergency alerts found.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {alerts.map((alert) => (
        <EmergencyAlertCard key={alert.id} alert={alert} />
      ))}
    </>
  );
}

export function EmergencyAlertsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold">Emergency Alerts</h2>
        <Badge className="ml-2 bg-red-500">LIVE</Badge>
      </div>
      <p className="text-muted-foreground">
        Real-time emergency alerts from ANI News
      </p>
      <EmergencyAlertsList />
    </div>
  );
}

export default EmergencyAlertsSection;
