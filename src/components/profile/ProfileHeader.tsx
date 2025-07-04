import { User, Camera } from "lucide-react";
import type { ProfileData } from "./types";

interface ProfileHeaderProps {
  profileData: ProfileData;
  photoPreview: string | null;
  editing: boolean;
  onPhotoSelect: (file: File) => void;
  categorias: any[];
}

export const ProfileHeader = ({ 
  profileData, 
  photoPreview, 
  editing, 
  onPhotoSelect,
  categorias 
}: ProfileHeaderProps) => {
  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-4 group">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center overflow-hidden">
          {(photoPreview || profileData.foto_perfil) ? (
            <img 
              src={photoPreview || profileData.foto_perfil} 
              alt={profileData.nome}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-primary-foreground" />
          )}
        </div>
        
        {editing && (
          <label htmlFor="foto-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-6 h-6 text-white" />
            <input
              id="foto-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPhotoSelect(file);
              }}
            />
          </label>
        )}
      </div>
      <h1 className="text-2xl font-bold">{profileData.nome}</h1>
      <p className="text-muted-foreground">
        {categorias.find(c => c.id === profileData.categoria_id)?.nome} • {profileData.cidade}
      </p>
    </div>
  );
};