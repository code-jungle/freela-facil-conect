import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { EditData } from "./types";

interface PhotoUploadProps {
  editing: boolean;
  editData: EditData;
  onPhotoSelect: (file: File) => void;
  hasExistingPhoto: boolean;
}

export const PhotoUpload = ({ 
  editing, 
  editData, 
  onPhotoSelect, 
  hasExistingPhoto 
}: PhotoUploadProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="foto-alt">Upload de foto</Label>
      {editing ? (
        <div className="space-y-3">
          <label htmlFor="foto-alt-upload" className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors cursor-pointer group">
            <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm text-muted-foreground group-hover:text-primary">
              Clique para selecionar uma foto
            </span>
            <input
              id="foto-alt-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPhotoSelect(file);
              }}
            />
          </label>
          {editData.foto_perfil_file && (
            <p className="text-sm text-muted-foreground">
              ✓ Arquivo selecionado: {editData.foto_perfil_file.name}
            </p>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {hasExistingPhoto ? "Foto carregada" : "Nenhuma foto"}
        </div>
      )}
    </div>
  );
};