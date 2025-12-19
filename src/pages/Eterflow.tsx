import { PageLayout } from "@/components/layout/PageLayout";
import SocialMediaPipeline from "@/components/pipeline/SocialMediaPipeline";
import eterLogo from "@/assets/eter-logo.png";

const Eterflow = () => {
  return (
    <PageLayout showTitle={false}>
      <div className="relative flex flex-col gap-4 -mx-4 md:-mx-8 -mt-4 md:-mt-8">
        {/* Logo Eter Hub Background */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src={eterLogo}
            alt=""
            className="h-64 opacity-5"
          />
        </div>

        <div className="relative z-10 flex flex-col h-full px-4 md:px-8 pt-4 md:pt-6">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Eterflow Pipeline</h1>
              <p className="text-white/60 text-sm md:text-base">Geração de Conteúdo Viral - De Ponta a Ponta</p>
            </div>
          </div>

          <div className="flex-1 min-h-[calc(100vh-180px)]">
            <SocialMediaPipeline />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Eterflow;