import { useState } from "react";
import { Link2, Plus, Trash2, ExternalLink } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EditableField } from "./EditableField";

export interface LinkItem {
  id: string;
  name: string;
  url: string;
}

interface AcessoRapidoCardProps {
  data: LinkItem[];
  onChange: (data: LinkItem[]) => void;
}

export const AcessoRapidoCard = ({ data, onChange }: AcessoRapidoCardProps) => {
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
    };
    onChange([...data, newLink]);
  };

  const removeLink = (id: string) => {
    onChange(data.filter((link) => link.id !== id));
  };

  return (
    <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(120,255,100,0.08)]">
      <Accordion type="single" collapsible defaultValue="acesso">
        <AccordionItem value="acesso" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                Acesso Rápido
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              <div className="border border-primary/20 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 hover:bg-primary/10">
                      <TableHead className="text-primary font-semibold">Nome</TableHead>
                      <TableHead className="text-primary font-semibold">Link</TableHead>
                      <TableHead className="text-primary font-semibold w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          Nenhum link adicionado. Clique no botão abaixo para adicionar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((link) => (
                        <TableRow key={link.id} className="border-t border-primary/10 hover:bg-primary/5">
                          <TableCell>
                            <EditableField
                              value={link.name}
                              onChange={(value) => updateLink(link.id, "name", value)}
                              placeholder="Nome do link..."
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <EditableField
                                value={link.url}
                                onChange={(value) => updateLink(link.id, "url", value)}
                                placeholder="https://..."
                                className="flex-1"
                              />
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
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLink(link.id)}
                              className="hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <Button
                variant="outline"
                onClick={addLink}
                className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Link
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
