import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface EmptyStateProps {
  onClearFilters: () => void;
}

export const EmptyState = ({ onClearFilters }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <User className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-semibold mb-4">Nenhum profissional encontrado</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Tente ajustar os filtros ou remover alguns critérios de busca para encontrar mais profissionais.
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        Limpar Filtros
      </Button>
    </div>
  );
};