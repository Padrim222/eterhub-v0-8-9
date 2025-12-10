import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadCard } from "./LeadCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  onDelete?: () => void;
  onDeleteLead?: (leadId: string) => void;
}

export const ICPColumn = ({ icp, leads, onDelete, onDeleteLead }: ICPColumnProps) => {
  return (
    <Card className="bg-gray-900/30 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">{icp.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-white/90">
              {leads.length} leads
            </Badge>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Excluir ICP</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      Tem certeza que deseja excluir o ICP "{icp.name}"? 
                      {leads.length > 0 && ` Os ${leads.length} leads associados serão mantidos, mas ficarão sem ICP.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {leads.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-8">
            Nenhum lead neste ICP
          </p>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} color={icp.color} onDelete={onDeleteLead} />)
        )}
      </CardContent>
    </Card>
  );
};
