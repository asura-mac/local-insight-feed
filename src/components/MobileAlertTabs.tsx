import { useState } from 'react';
import { MapPin, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileAlertTabsProps {
  activeTab: 'regional' | 'national' | 'international';
  onTabChange: (tab: 'regional' | 'national' | 'international') => void;
  regionalCount: number;
  nationalCount: number;
  internationalCount: number;
}

const tabs = [
  {
    id: 'regional' as const,
    label: 'Regional',
    icon: MapPin,
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-800/30',
  },
  {
    id: 'national' as const,
    label: 'National',
    icon: Shield,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-800/30',
  },
  {
    id: 'international' as const,
    label: 'International',
    icon: Globe,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-800/30',
  },
];

export function MobileAlertTabs({
  activeTab,
  onTabChange,
  regionalCount,
  nationalCount,
  internationalCount,
}: MobileAlertTabsProps) {
  const counts = {
    regional: regionalCount,
    national: nationalCount,
    international: internationalCount,
  };

  return (
    <div className="lg:hidden mb-6">
      <div className="bg-dark-surface rounded-lg border border-dark-border p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                variant="ghost"
                className={cn(
                  'flex-1 h-12 px-3 text-sm font-medium transition-all duration-200 relative overflow-hidden',
                  'touch-target focus-visible-ring',
                  isActive
                    ? `${tab.bgColor} ${tab.borderColor} border text-gray-900`
                    : 'text-dark-text-secondary hover:text-gray-900 hover:bg-dark-surface-light'
                )}
              >
                <div className="flex flex-col items-center space-y-1">
                  <Icon className={cn('h-4 w-4', isActive ? tab.color : 'text-dark-text-muted')} />
                  <span className="text-xs">{tab.label}</span>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                    isActive 
                      ? 'bg-dark-surface text-gray-900' 
                      : 'bg-dark-surface-light text-dark-text-secondary'
                  )}>
                    {counts[tab.id]}
                  </span>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5',
                    tab.borderColor.replace('border-', 'bg-')
                  )} />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 