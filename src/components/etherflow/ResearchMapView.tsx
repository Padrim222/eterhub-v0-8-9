import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, Users, BookOpen, MessageSquare, Shield, TrendingUp, Link2 } from "lucide-react";

interface ResearchMapData {
  theme_title: string;
  numerical_data?: Array<{
    statistic: string;
    source: string;
    impact_level: string;
  }>;
  cases?: Array<{
    type: string;
    title: string;
    description: string;
    main_lesson: string;
  }>;
  narratives_metaphors?: Array<{
    type: string;
    content: string;
  }>;
  social_voice?: {
    main_controversy: string;
    limiting_beliefs: string[];
    frequent_questions: string[];
  };
  antagonists?: Array<{
    objection: string;
    counter_argument: string;
  }>;
  cultural_trends?: string[];
  central_message_connection?: string;
}

interface ResearchMapViewProps {
  data: ResearchMapData;
}

export function ResearchMapView({ data }: ResearchMapViewProps) {
  return (
    <Card className="bg-card-dark border-gray-700/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700/50">
        <h3 className="font-semibold text-white">Mapa de Pesquisa</h3>
        <p className="text-sm text-white/50 mt-1">{data.theme_title}</p>
      </div>

      <ScrollArea className="h-[500px]">
        <Accordion type="multiple" className="p-4">
          {/* Numerical Data */}
          {data.numerical_data && data.numerical_data.length > 0 && (
            <AccordionItem value="numerical" className="border-gray-700/50">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span>Dados Numéricos ({data.numerical_data.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {data.numerical_data.map((item, i) => (
                    <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-white">{item.statistic}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.impact_level}
                        </Badge>
                        <span className="text-xs text-white/50">{item.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Cases */}
          {data.cases && data.cases.length > 0 && (
            <AccordionItem value="cases" className="border-gray-700/50">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Cases Relevantes ({data.cases.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {data.cases.map((item, i) => (
                    <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={item.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {item.type === "success" ? "Sucesso" : "Fracasso"}
                        </Badge>
                        <span className="font-medium text-white text-sm">{item.title}</span>
                      </div>
                      <p className="text-sm text-white/70">{item.description}</p>
                      <p className="text-xs text-primary mt-2">Lição: {item.main_lesson}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Narratives & Metaphors */}
          {data.narratives_metaphors && data.narratives_metaphors.length > 0 && (
            <AccordionItem value="narratives" className="border-gray-700/50">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>Narrativas e Metáforas ({data.narratives_metaphors.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {data.narratives_metaphors.map((item, i) => (
                    <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
                      <Badge variant="outline" className="text-xs mb-2">{item.type}</Badge>
                      <p className="text-sm text-white/80">{item.content}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Social Voice */}
          {data.social_voice && (
            <AccordionItem value="social" className="border-gray-700/50">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span>A Voz do Povo</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-white/50 mb-1">Principal Polêmica:</p>
                    <p className="text-sm text-white">{data.social_voice.main_controversy}</p>
                  </div>
                  {data.social_voice.limiting_beliefs && (
                    <div>
                      <p className="text-xs text-white/50 mb-2">Crenças Limitantes:</p>
                      <div className="space-y-2">
                        {data.social_voice.limiting_beliefs.map((belief, i) => (
                          <p key={i} className="text-sm text-white/80 pl-3 border-l-2 border-red-500">"{belief}"</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.social_voice.frequent_questions && (
                    <div>
                      <p className="text-xs text-white/50 mb-2">Dúvidas Frequentes:</p>
                      <div className="space-y-2">
                        {data.social_voice.frequent_questions.map((q, i) => (
                          <p key={i} className="text-sm text-white/80 pl-3 border-l-2 border-blue-500">"{q}"</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Antagonists */}
          {data.antagonists && data.antagonists.length > 0 && (
            <AccordionItem value="antagonists" className="border-gray-700/50">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span>Objeções ({data.antagonists.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {data.antagonists.map((item, i) => (
                    <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-red-300">❌ {item.objection}</p>
                      <p className="text-sm text-green-300 mt-2">✓ {item.counter_argument}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Cultural Trends */}
          {data.cultural_trends && data.cultural_trends.length > 0 && (
            <AccordionItem value="trends" className="border-gray-700/50">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>Tendências Culturais</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2">
                  {data.cultural_trends.map((trend, i) => (
                    <Badge key={i} variant="outline">{trend}</Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Central Message Connection */}
          {data.central_message_connection && (
            <AccordionItem value="connection" className="border-gray-700/50">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  <span>Conexão com Mensagem Central</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-white/80">{data.central_message_connection}</p>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </ScrollArea>
    </Card>
  );
}
