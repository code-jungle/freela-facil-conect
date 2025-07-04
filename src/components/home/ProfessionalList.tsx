import { ProfessionalCard } from "./ProfessionalCard";
import { EmptyState } from "./EmptyState";
import { Profile } from "@/types";

interface ProfessionalListProps {
  profiles: Profile[];
  navigating: boolean;
  onNavigation: (path: string) => void;
  onWhatsAppClick: (profile: Profile) => void;
  onClearFilters: () => void;
}

export const ProfessionalList = ({ 
  profiles, 
  navigating, 
  onNavigation, 
  onWhatsAppClick,
  onClearFilters 
}: ProfessionalListProps) => {
  if (profiles.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {profiles.length} profissional{profiles.length !== 1 ? 'is' : ''} {profiles.length !== 1 ? 'encontrados' : 'encontrado'}
          </h2>
          <p className="text-muted-foreground">
            Escolha o profissional ideal para seu projeto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(profile => (
          <ProfessionalCard
            key={profile.id}
            profile={profile}
            navigating={navigating}
            onNavigation={onNavigation}
            onWhatsAppClick={onWhatsAppClick}
          />
        ))}
      </div>
    </>
  );
};