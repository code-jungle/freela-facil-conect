import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Categoria } from "@/types";

interface FilterSectionProps {
  searchTerm: string;
  selectedTipo: string;
  selectedCategoria: string;
  selectedCidade: string;
  categorias: Categoria[];
  cidades: string[];
  onSearchTermChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onCategoriaChange: (value: string) => void;
  onCidadeChange: (value: string) => void;
}

export const FilterSection = ({
  searchTerm,
  selectedTipo,
  selectedCategoria,
  selectedCidade,
  categorias,
  cidades,
  onSearchTermChange,
  onTipoChange,
  onCategoriaChange,
  onCidadeChange
}: FilterSectionProps) => {
  const categoriasFiltradas = selectedTipo === "todos" 
    ? categorias 
    : categorias.filter(c => c.tipo_profissional === selectedTipo);

  return (
    <section className="bg-card border-y border-border sticky top-[73px] z-40" id="profissionais">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar profissionais..." 
              value={searchTerm} 
              onChange={e => onSearchTermChange(e.target.value)} 
              className="pl-10" 
            />
          </div>

          {/* Tipo de profissional */}
          <Select value={selectedTipo} onValueChange={onTipoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="freelancer">Freelancer</SelectItem>
              <SelectItem value="prestador">Prestador de Serviço</SelectItem>
            </SelectContent>
          </Select>

          {/* Tipo de serviço */}
          <Select value={selectedCategoria} onValueChange={onCategoriaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os serviços</SelectItem>
              {categoriasFiltradas.map(categoria => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Cidade */}
          <Select value={selectedCidade} onValueChange={onCidadeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as cidades</SelectItem>
              {cidades.map(cidade => (
                <SelectItem key={cidade} value={cidade}>
                  {cidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
};