import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingDown, Calendar, Target } from "lucide-react";
import { motion } from "framer-motion";

interface AIProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: 'flow' | 'insights' | 'content' | 'tribes';
  reason: string;
  metric?: {
    value: string | number;
    change: number;
  };
}

const productConfig = {
  flow: {
    title: "ETER Flow",
    description: "Automatize seu fluxo de conteúdo e leads",
    features: [
      "Análise automática de performance",
      "Recomendações personalizadas",
      "Integração com CRM"
    ],
    color: "bg-blue-500",
    icon: <Target size={48} />
  },
  insights: {
    title: "ETER Insights Pro",
    description: "Inteligência artificial avançada para suas métricas",
    features: [
      "Detecção de padrões",
      "Alertas em tempo real",
      "Análise preditiva"
    ],
    color: "bg-purple-500",
    icon: <Sparkles size={48} />
  },
  content: {
    title: "ETER Content AI",
    description: "Criação de conteúdo assistida por IA",
    features: [
      "Geração de roteiros",
      "Sugestões de temas",
      "Análise de concorrentes"
    ],
    color: "bg-orange-500",
    icon: <Calendar size={48} />
  },
  tribes: {
    title: "ETER Tribes",
    description: "Simulação de públicos com IA",
    features: [
      "Teste de campanhas",
      "Validação pré-gasto",
      "Insights acionáveis"
    ],
    color: "bg-green-500",
    icon: <Sparkles size={48} />
  }
};

export const AIProductModal = ({
  isOpen,
  onClose,
  productType,
  reason,
  metric
}: AIProductModalProps) => {
  const product = productConfig[productType];

  useEffect(() => {
    // Salvar no localStorage quando modal for fechado com "Agora Não"
    const handleDismiss = () => {
      const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias
      localStorage.setItem(
        `ai-product-dismissed-${productType}`,
        dismissedUntil.toString()
      );
    };

    return () => {
      if (!isOpen) {
        handleDismiss();
      }
    };
  }, [isOpen, productType]);

  const handleAction = () => {
    // Redirecionar para página do produto
    window.open(`https://eter.com.br/produtos/${productType}`, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`${product.color} p-4 rounded-2xl text-white`}
            >
              {product.icon}
            </motion.div>
            
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-1">
                {product.title}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {product.description}
              </DialogDescription>
            </div>

            <Badge className="bg-[#38EE38] text-black border-0 text-xs">
              Recomendado
            </Badge>
          </div>
        </DialogHeader>

        {/* Motivo da recomendação */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4"
        >
          <div className="flex items-start gap-3">
            <TrendingDown className="text-yellow-400 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-yellow-400 font-medium mb-1">
                Por que estamos recomendando?
              </p>
              <p className="text-white/80 text-sm">{reason}</p>
              
              {metric && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-white font-bold text-lg">
                    {metric.value}
                  </span>
                  <span className={`text-sm ${metric.change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <p className="text-white/60 text-sm font-medium">O que você vai conseguir:</p>
          {product.features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              className="flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#38EE38]" />
              <span className="text-white/80 text-sm">{feature}</span>
            </motion.div>
          ))}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            Agora Não
          </Button>
          <Button
            onClick={handleAction}
            className="bg-[#38EE38] text-black hover:bg-[#2DD82D] flex-1"
          >
            <Sparkles size={16} className="mr-2" />
            Ver Produto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook helper para verificar se deve mostrar o modal
export const useShouldShowProductModal = (productType: string): boolean => {
  const dismissedUntil = localStorage.getItem(`ai-product-dismissed-${productType}`);
  
  if (!dismissedUntil) return true;
  
  const dismissedTimestamp = parseInt(dismissedUntil, 10);
  return Date.now() > dismissedTimestamp;
};
