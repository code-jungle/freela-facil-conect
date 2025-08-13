import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ProfileData, EditData, Categoria } from "./types";

interface ProfileFormProps {
  editing: boolean;
  profileData: ProfileData;
  editData: EditData;
  categorias: Categoria[];
  onDataChange: (data: EditData) => void;
}

export const ProfileForm = ({ 
  editing, 
  profileData, 
  editData, 
  categorias, 
  onDataChange 
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
          <Label htmlFor="categoria">Tipo de serviço</Label>
          <Select 
            value={editing ? editData.categoria_id || '' : profileData.categoria_id}
            onValueChange={(value) => onDataChange({...editData, categoria_id: value})}
            disabled={!editing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoriasFiltradas.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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