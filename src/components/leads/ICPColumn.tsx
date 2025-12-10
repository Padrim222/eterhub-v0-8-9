import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadCard } from "./LeadCard";
import { Badge } from "@/components/ui/badge";

interface ICP {
  id: string;
  name: string;
  color: string;
}

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source_channel?: string;
  income?: number;
  qualification_score: number;
  engagement_score: number;
  lead_score: number;
  is_qualified: boolean;
}

interface ICPColumnProps {
  icp: ICP;
  leads: Lead[];
}

export const ICPColumn = ({ icp, leads }: ICPColumnProps) => {
  return (
    <Card className="bg-gray-900/30 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">{icp.name}</CardTitle>
          <Badge variant="outline" className="text-xs text-white/90">
            {leads.length} leads
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {leads.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-8">
            Nenhum lead neste ICP
          </p>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} color={icp.color} />)
        )}
      </CardContent>
    </Card>
  );
};