import { PageLayout } from "@/components/layout/PageLayout";
import { FlowBuilder } from "@/components/eterflow/FlowBuilder";
import eterLogo from "@/assets/eter-logo.png";

const Eterflow = () => {
  return (
    <PageLayout title="Eterflow Network">
      <div className="relative min-h-screen flex flex-col gap-6">
        {/* Logo Eter Hub Background */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src={eterLogo}
            alt=""
            className="h-64 opacity-5"
          />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Fluxos de IA</h2>
              <p className="text-white/60">Construa agentes e automações arrastando e soltando nós.</p>
            </div>
            <button className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition-colors">
              Novo Fluxo
            </button>
          </div>

          <div className="flex-1 min-h-[700px]">
            <FlowBuilder />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Eterflow;