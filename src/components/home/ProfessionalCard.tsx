import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, CheckCircle } from "lucide-react";
import { Profile } from "@/types";

interface ProfessionalCardProps {
  profile: Profile;
  navigating: boolean;
  onNavigation: (path: string) => void;
  onWhatsAppClick: (profile: Profile) => void;
}

export const ProfessionalCard = ({ 
  profile, 
  navigating, 
  onNavigation, 
  onWhatsAppClick 
}: ProfessionalCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 gradient-card border-0">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-2xl font-semibold text-white overflow-hidden">
              {profile.foto_perfil ? (
                <img 
                  src={profile.foto_perfil} 
                  alt={profile.nome} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                profile.nome.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate mb-1">{profile.nome}</h3>
            <p className="text-sm font-medium text-primary capitalize mb-1">
              {profile.categorias.nome}
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {profile.cidade}
            </div>
          </div>
        </div>

        {profile.descricao && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
            {profile.descricao}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onNavigation(`/profile/${profile.id}`)}
            disabled={navigating}
          >
            Ver Perfil
          </Button>
          <Button 
            className="flex-1 gradient-primary text-white border-0" 
            onClick={() => onWhatsAppClick(profile)}
          >
            <Phone className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};