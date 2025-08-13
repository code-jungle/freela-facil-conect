import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileData, EditData, Categoria } from "./types";

interface ProfileFormProps {
  editing: boolean;
  profileData: ProfileData;
  editData: EditData;
  categorias: Categoria[];
  onDataChange: (data: EditData) => void;
  openCategoria?: boolean;
  setOpenCategoria?: (open: boolean) => void;
}

export const ProfileForm = ({ 
  editing, 
  profileData, 
  editData, 
  categorias, 
  onDataChange,
  openCategoria = false,
  setOpenCategoria = () => {}
}: ProfileFormProps) => {
  const categoriasFiltradas = (editData.tipo_profissional && editData.tipo_profissional.length > 0)
    ? categorias.filter(c => editData.tipo_profissional!.includes(c.tipo_profissional))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input
            id="nome"
            value={editing ? editData.nome || '' : profileData.nome}
            onChange={(e) => onDataChange({...editData, nome: e.target.value})}
            disabled={!editing}
          />
        </div>


        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={editing ? editData.whatsapp || '' : profileData.whatsapp || ''}
            onChange={(e) => onDataChange({...editData, whatsapp: e.target.value})}
            disabled={!editing}
            placeholder="Opcional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={editing ? editData.cidade || '' : profileData.cidade}
            onChange={(e) => onDataChange({...editData, cidade: e.target.value})}
            disabled={!editing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de profissional</Label>
          <ToggleGroup 
            type="multiple"
            value={editing ? editData.tipo_profissional || [] : profileData.tipo_profissional || []}
            onValueChange={(value) => onDataChange({...editData, tipo_profissional: value, categoria_id: ''})}
            disabled={!editing}
            className="justify-start gap-2"
          >
            <ToggleGroupItem 
              value="freelancer" 
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Freelancer
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="prestador" 
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Prestador de Serviço
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Especialidades</Label>
          
          {/* Mostrar categorias selecionadas */}
          {editing && editData.categoria_ids && editData.categoria_ids.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {editData.categoria_ids.map(id => {
                const categoria = categorias.find(c => c.id === id);
                return categoria ? (
                  <div key={id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    <span>{categoria.nome}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newIds = editData.categoria_ids?.filter(catId => catId !== id) || [];
                        onDataChange({...editData, categoria_ids: newIds});
                      }}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {editing ? (
            <Popover open={openCategoria} onOpenChange={setOpenCategoria}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCategoria}
                  className="w-full justify-between"
                >
                  {editData.categoria_ids && editData.categoria_ids.length > 0
                    ? `${editData.categoria_ids.length} categoria${editData.categoria_ids.length > 1 ? 's' : ''} selecionada${editData.categoria_ids.length > 1 ? 's' : ''}`
                    : 'Selecione as especialidades'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-card text-foreground z-[80]" align="start">
                <Command>
                  <CommandInput placeholder="Buscar especialidade..." className="h-10" />
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {categoriasFiltradas.map((categoria) => (
                        <CommandItem
                          key={categoria.id}
                          value={categoria.nome}
                          onSelect={() => {
                            const currentIds = editData.categoria_ids || [];
                            const isSelected = currentIds.includes(categoria.id);
                            let newIds;
                            
                            if (isSelected) {
                              newIds = currentIds.filter(id => id !== categoria.id);
                            } else {
                              newIds = [...currentIds, categoria.id];
                            }
                            
                            onDataChange({
                              ...editData, 
                              categoria_ids: newIds,
                              categoria_id: newIds[0] || ''
                            });
                          }}
                          className="cursor-pointer"
                        >
                          <Check className={cn("mr-2 h-4 w-4", editData.categoria_ids?.includes(categoria.id) ? "opacity-100" : "opacity-0")} />
                          {categoria.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileData.categoria_ids?.map(id => {
                const categoria = categorias.find(c => c.id === id);
                return categoria ? (
                  <div key={id} className="bg-muted/50 text-muted-foreground px-2 py-1 rounded-md text-sm">
                    {categoria.nome}
                  </div>
                ) : null;
              }) || (
                <div className="text-muted-foreground text-sm">Nenhuma especialidade definida</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={editing ? editData.descricao || '' : profileData.descricao || ''}
          onChange={(e) => onDataChange({...editData, descricao: e.target.value})}
          disabled={!editing}
          placeholder="Conte sobre sua experiência e serviços..."
          rows={4}
        />
      </div>
    </div>
  );
};