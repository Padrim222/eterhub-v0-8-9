import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

export const EditableField = ({ 
  value, 
  onChange, 
  label, 
  multiline = false,
  placeholder = "Clique para editar...",
  className = ""
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleBlur = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleBlur();
    }
    if (e.key === "Escape") {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      )}
      
      {isEditing ? (
        multiline ? (
          <Textarea 
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bg-gray-800 border-gray-700 focus:border-primary min-h-[80px] text-white"
          />
        ) : (
          <Input 
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bg-gray-800 border-gray-700 focus:border-primary text-white"
          />
        )
      ) : (
        <div 
          onClick={() => { setTempValue(value); setIsEditing(true); }}
          className="cursor-pointer group flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-gray-700"
        >
          <p className="text-white flex-1">
            {value || <span className="text-white/50 italic">{placeholder}</span>}
          </p>
          <Pencil className="w-3 h-3 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
};
