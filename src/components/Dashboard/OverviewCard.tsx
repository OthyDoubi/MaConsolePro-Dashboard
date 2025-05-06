'use client'

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clipboard, Package, Truck, PhoneCall, Loader2 } from "lucide-react"

export interface OverviewCardProps {
  title: string;
  value?: string;
  valueColor?: string;
  loading?: boolean;
  count?: number;
  total?: number;
  date?: string;
  bgColor?: string;
}

export function OverviewCard({ 
  title, 
  value, 
  valueColor = "text-foreground",
  loading = false,
  count, 
  total, 
  date,
  bgColor = "bg-card"
}: OverviewCardProps) {
  // Si on a count et total, utiliser l'ancienne logique
  if (typeof count === 'number' && typeof total === 'number') {
    const progressValue = total > 0 ? (count / total) * 100 : 0;
    return (
      <Card className={`${bgColor} shadow-md border-0`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{count}/{total}</div>
          <Progress 
            value={progressValue} 
            className={`mt-2 h-2 ${
              progressValue < 30 
                ? "bg-red-500/25 [&>div]:bg-red-500" 
                : progressValue < 70 
                  ? "bg-yellow-500/25 [&>div]:bg-yellow-500" 
                  : "bg-green-500/25 [&>div]:bg-green-500"
            }`}
          />
          <p className="text-xs text-gray-300 mt-1">
            {`${Math.round(progressValue)}% traité${count > 1 ? 's' : ''}`}
          </p>
          {date && (
            <p className="text-xs text-gray-300 mt-1">
              {title} du {date}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Nouvelle logique pour valeur simple
  return (
    <Card className={`${bgColor} shadow-md border-0`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-white">
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span className="text-sm text-white/80">Chargement...</span>
          </div>
        ) : (
          <div className={`text-3xl font-bold ${valueColor}`}>
            {value || "0"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}