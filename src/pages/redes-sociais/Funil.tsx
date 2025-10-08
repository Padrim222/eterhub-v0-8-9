import { Card } from "@/components/ui/card";
import { FunnelVisualization } from "@/components/dashboard/FunnelVisualization";

const Funil = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Funil de Conversão</h1>
        <p className="text-gray-400 mt-2">Acompanhe a jornada do seu público nas redes sociais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black border-gray-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6">Visualização do Funil</h2>
          <FunnelVisualization 
            attention={85}
            retention={65}
            engagement={45}
            conversion={25}
            movqlScore={72}
          />
        </Card>

        <div className="space-y-6">
          <Card className="bg-black border-gray-800 rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Atenção</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Alcance Total</span>
                <span className="text-white font-medium">125.4K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Impressões</span>
                <span className="text-white font-medium">248.8K</span>
              </div>
            </div>
          </Card>

          <Card className="bg-black border-gray-800 rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Retenção</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Visualizações Completas</span>
                <span className="text-white font-medium">81.5K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taxa de Retenção</span>
                <span className="text-green-400 font-medium">65%</span>
              </div>
            </div>
          </Card>

          <Card className="bg-black border-gray-800 rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Engajamento</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Interações Totais</span>
                <span className="text-white font-medium">56.4K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taxa de Engajamento</span>
                <span className="text-green-400 font-medium">45%</span>
              </div>
            </div>
          </Card>

          <Card className="bg-black border-gray-800 rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Conversão</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cliques no Link</span>
                <span className="text-white font-medium">31.3K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taxa de Conversão</span>
                <span className="text-green-400 font-medium">25%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Funil;
