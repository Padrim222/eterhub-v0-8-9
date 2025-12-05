import { RefreshCw, Plus, Trash2, CheckCircle, XCircle, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableField } from "./EditableField";

export interface RetrospectiveData {
  keepDoing: string[];
  stopDoing: string[];
  startDoing: string[];
}

interface RetrospectivaTrimestralCardProps {
  data: RetrospectiveData;
  onChange: (data: RetrospectiveData) => void;
}

export const RetrospectivaTrimestralCard = ({ data, onChange }: RetrospectivaTrimestralCardProps) => {
  const updateItem = (category: keyof RetrospectiveData, index: number, value: string) => {
    const updated = [...data[category]];
    updated[index] = value;
    onChange({ ...data, [category]: updated });
  };

  const addItem = (category: keyof RetrospectiveData) => {
    onChange({ ...data, [category]: [...data[category], ""] });
  };

  const removeItem = (category: keyof RetrospectiveData, index: number) => {
    const updated = data[category].filter((_, i) => i !== index);
    onChange({ ...data, [category]: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <RefreshCw className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Retrospectiva Trimestral</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Keep Doing */}
        <Card className="bg-green-950/30 border-green-500/30 p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h4 className="text-green-400 font-semibold">Keep Doing</h4>
          </div>
          <div className="space-y-2">
            {data.keepDoing.map((item, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0" />
                <EditableField
                  value={item}
                  onChange={(value) => updateItem("keepDoing", index, value)}
                  placeholder="O que continuar fazendo..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem("keepDoing", index)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 h-8 w-8"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addItem("keepDoing")}
              className="text-green-400 hover:bg-green-500/10 w-full justify-start"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </Card>

        {/* Stop Doing */}
        <Card className="bg-red-950/30 border-red-500/30 p-4">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-400" />
            <h4 className="text-red-400 font-semibold">Stop Doing</h4>
          </div>
          <div className="space-y-2">
            {data.stopDoing.map((item, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                <EditableField
                  value={item}
                  onChange={(value) => updateItem("stopDoing", index, value)}
                  placeholder="O que parar de fazer..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem("stopDoing", index)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 h-8 w-8"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addItem("stopDoing")}
              className="text-red-400 hover:bg-red-500/10 w-full justify-start"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </Card>

        {/* Start Doing */}
        <Card className="bg-blue-950/30 border-blue-500/30 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-blue-400" />
            <h4 className="text-blue-400 font-semibold">Start Doing</h4>
          </div>
          <div className="space-y-2">
            {data.startDoing.map((item, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                <EditableField
                  value={item}
                  onChange={(value) => updateItem("startDoing", index, value)}
                  placeholder="O que começar a fazer..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem("startDoing", index)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 h-8 w-8"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addItem("startDoing")}
              className="text-blue-400 hover:bg-blue-500/10 w-full justify-start"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
