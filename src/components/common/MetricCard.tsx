
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  bgColor?: string;
  bgHoverColor?: string;
  textColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  iconColor = 'text-blue-600',
  bgColor = 'bg-white',
  bgHoverColor = 'hover:bg-gray-50',
  textColor = 'text-gray-900',
}) => {
  return (
    <Card className={`${bgColor} ${bgHoverColor} transition-all duration-200`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`mt-2 text-2xl font-semibold ${textColor}`}>{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <span className={change.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {change.isPositive ? '+' : ''}
                  {change.value}%
                </span>
                <span className="text-gray-500 text-xs ml-1">from previous period</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-2 rounded-full ${iconColor} bg-opacity-10`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
