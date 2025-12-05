import { useRef } from "react";
import { Plus, Trash2, FileText, ExternalLink } from "lucide-react";
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
  pdf: { label: "PDF" },
  xlsx: { label: "XLSX" },
  docx: { label: "DOCX" },
  zip: { label: "ZIP" },
  link: { label: "LINK" },
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateLink = (id: string, field: keyof LinkItem, value: string) => {
    const updated = data.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    onChange(updated);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newLinks: LinkItem[] = Array.from(files).map((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let type: LinkItem["type"] = "link";
      if (ext === "pdf") type = "pdf";
      else if (ext === "xlsx" || ext === "xls") type = "xlsx";
      else if (ext === "docx" || ext === "doc") type = "docx";
      else if (ext === "zip" || ext === "rar") type = "zip";

      return {
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        type,
        date: new Date().toLocaleDateString('pt-BR'),
      };
    });

    onChange([...data, ...newLinks]);
    event.target.value = "";
  };

  const removeLink = (id: string) => {
    onChange(data.filter((link) => link.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.docx,.doc,.zip,.rar,.png,.jpg,.jpeg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Título FORA do card com botão + discreto */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Arquivos & Links</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* Card com fundo cinza */}
      <Card className="bg-card-dark border-gray-700 p-4">
        {data.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            Nenhum arquivo adicionado. Clique no + para fazer upload.
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((link, index) => {
              const linkType = link.type || getTypeFromUrl(link.url);
              
              return (
                <div
                  key={link.id}
                  className={`flex items-center gap-4 p-3 hover:bg-gray-900 rounded-lg transition-colors group ${
                    index !== data.length - 1 ? "border-b border-gray-800" : ""
                  }`}
                >
                  {/* Ícone documento em quadrado preto/cinza escuro */}
                  <div className="p-3 bg-gray-800 rounded-lg shrink-0">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  {/* Nome + Data/Badge */}
                  <div className="flex-1 min-w-0">
                    <EditableField
                      value={link.name}
                      onChange={(value) => updateLink(link.id, "name", value)}
                      placeholder="Nome do arquivo..."
                      className="font-semibold text-white text-lg"
                    />
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-white/50">
                        {link.date || new Date().toLocaleDateString('pt-BR')}
                      </span>
                      <Badge className="bg-gray-700 text-white/80 border-0 text-xs rounded">
                        {typeConfig[linkType].label}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Link externo + Deletar (hover) */}
                  <div className="flex items-center gap-1 shrink-0">
                    {link.url && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
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
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
