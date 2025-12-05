import { Folder, Plus, Trash2, ExternalLink, FileText, FileSpreadsheet, File, FileArchive, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditableField } from "./EditableField";

export interface LinkItem {
  id: string;
  name: string;
  url: string;
  type?: "pdf" | "xlsx" | "docx" | "zip" | "link";
  date?: string;
}

interface ArquivosLinksSectionProps {
  data: LinkItem[];
  onChange: (data: LinkItem[]) => void;
}

const typeConfig = {
  pdf: { icon: FileText, color: "bg-red-500/20 text-red-400", label: "PDF" },
  xlsx: { icon: FileSpreadsheet, color: "bg-green-500/20 text-green-400", label: "XLSX" },
  docx: { icon: FileText, color: "bg-blue-500/20 text-blue-400", label: "DOCX" },
  zip: { icon: FileArchive, color: "bg-yellow-500/20 text-yellow-400", label: "ZIP" },
  link: { icon: Link2, color: "bg-primary/20 text-primary", label: "LINK" },
};

const getTypeFromUrl = (url: string): LinkItem["type"] => {
  if (!url) return "link";
  const ext = url.split('.').pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "zip" || ext === "rar") return "zip";
  return "link";
};

export const ArquivosLinksSection = ({ data, onChange }: ArquivosLinksSectionProps) => {
  const updateLink = (id: string, field: keyof LinkItem, value: string) => {
    const updated = data.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    onChange(updated);
  };

  const addLink = () => {
    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      name: "",
      url: "",
      type: "link",
      date: new Date().toLocaleDateString('pt-BR'),
    };
    onChange([...data, newLink]);
  };

  const removeLink = (id: string) => {
    onChange(data.filter((link) => link.id !== id));
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white">Arquivos & Links</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addLink}
          className="border-gray-700 text-primary hover:bg-primary/10 hover:border-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>
      
      <div className="p-4 space-y-2">
        {data.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            Nenhum arquivo ou link adicionado. Clique em "Adicionar" para começar.
          </div>
        ) : (
          data.map((link) => {
            const linkType = link.type || getTypeFromUrl(link.url);
            const config = typeConfig[linkType];
            const IconComponent = config.icon;
            
            return (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                    <IconComponent className={`w-4 h-4 ${config.color.split(' ')[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <EditableField
                      value={link.name}
                      onChange={(value) => updateLink(link.id, "name", value)}
                      placeholder="Nome do arquivo..."
                      className="font-medium"
                    />
                    <EditableField
                      value={link.url}
                      onChange={(value) => updateLink(link.id, "url", value)}
                      placeholder="https://..."
                      className="text-xs text-white/50"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-white/40 hidden sm:block">
                    {link.date || new Date().toLocaleDateString('pt-BR')}
                  </span>
                  <Badge className={`${config.color} border-0 text-xs`}>
                    {config.label}
                  </Badge>
                  {link.url && (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(link.id)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
