import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlertCircle, MapPin, ChevronsUpDown, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone } from "@/utils/validation";
import { buscarCep, formatCep } from "@/utils/cepService";
import type { Categoria, SignupFormData, ValidationErrors } from "@/components/auth/types";
import { cn } from "@/lib/utils";

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>;
  loading: boolean;
  validationErrors: ValidationErrors;
  onValidateField: (field: string, value: string) => void;
}

export const SignupForm = ({ onSubmit, loading, validationErrors, onValidateField }: SignupFormProps) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    nome: "",
    cep: "",
    whatsapp: "",
    cidade: "",
    tipo_profissional: [],
    categoria_id: "",
    descricao: "",
    foto_perfil: null
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [openCategoria, setOpenCategoria] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase.from('categorias').select('*').order('nome');
      if (error) {
        console.error('Erro ao buscar categorias:', error);
      } else {
        setCategorias(data || []);
      }
    };
    fetchCategorias();
  }, []);

  const categoriasFiltradas = formData.tipo_profissional.length > 0
    ? categorias.filter(c => formData.tipo_profissional.includes(c.tipo_profissional)) 
    : [];

  const gerarDescricaoAutomatica = (categoria: string, tipos: string[]) => {
    const categoria_obj = categorias.find(c => c.id === categoria);
    if (!categoria_obj) return "";
    const tipoTexto = tipos.length > 1 
      ? 'profissional versátil que atua tanto como freelancer quanto prestador de serviços'
      : tipos[0] === 'freelancer' ? 'freelancer' : 'prestador de serviços';
    return `Sou ${tipoTexto} especializado em ${categoria_obj.nome.toLowerCase()}. Tenho experiência na área e estou sempre disponível para novos projetos. Entre em contato para conhecer melhor meu trabalho!`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateFormData = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCepChange = async (cepValue: string) => {
    const cepFormatado = formatCep(cepValue);
    updateFormData('cep', cepFormatado);
    
    const cepLimpo = cepValue.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      setCepLoading(true);
      const dadosCep = await buscarCep(cepLimpo);
      if (dadosCep) {
        updateFormData('cidade', dadosCep.localidade);
      }
      setCepLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="signup-email">Email <span className="text-destructive" aria-hidden>*</span></Label>
          <Input 
            id="signup-email" 
            type="email" 
            value={formData.email} 
            onChange={e => {
              const value = e.target.value;
              updateFormData('email', value);
              if (value) onValidateField('email', value);
            }}
            onBlur={e => onValidateField('email', e.target.value)}
            inputMode="email" 
            autoComplete="email" 
            required 
            className={`h-12 text-base input-surface text-foreground placeholder:text-foreground ${validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="signup-password">Senha <span className="text-destructive" aria-hidden>*</span></Label>
          <Input 
            id="signup-password" 
            type="password" 
            value={formData.password} 
            onChange={e => {
              const value = e.target.value;
              updateFormData('password', value);
              if (value) onValidateField('password', value);
            }}
            onBlur={e => onValidateField('password', e.target.value)}
            autoComplete="new-password" 
            required 
            className={`h-12 text-base input-surface text-foreground placeholder:text-foreground ${validationErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
           />
          {validationErrors.password && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.password}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="nome">Nome completo <span className="text-destructive" aria-hidden>*</span></Label>
        <Input 
          id="nome" 
          value={formData.nome} 
          onChange={e => {
            const value = e.target.value;
            updateFormData('nome', value);
            if (value) onValidateField('nome', value);
          }}
          onBlur={e => onValidateField('nome', e.target.value)}
          autoComplete="name" 
          required 
          className={`h-12 text-base input-surface text-foreground placeholder:text-foreground ${validationErrors.nome ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        {validationErrors.nome && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.nome}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="cep">CEP <span className="text-destructive" aria-hidden>*</span></Label>
          <div className="relative">
            <Input 
              id="cep" 
              value={formData.cep} 
              onChange={e => handleCepChange(e.target.value)}
              placeholder="00000-000" 
              inputMode="numeric" 
              maxLength={9}
              required 
              className={`h-12 text-base input-surface text-foreground placeholder:text-foreground pr-10 ${validationErrors.cep ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {cepLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {validationErrors.cep && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.cep}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="whatsapp">WhatsApp <span className="text-destructive" aria-hidden>*</span></Label>
          <Input 
            id="whatsapp" 
            value={formData.whatsapp} 
            onChange={e => {
              const value = formatPhone(e.target.value);
              updateFormData('whatsapp', value);
              if (value) onValidateField('whatsapp', value);
            }}
            onBlur={e => onValidateField('whatsapp', e.target.value)}
            placeholder="(11) 99999-9999" 
            inputMode="tel" 
            required
            className={`h-12 text-base input-surface text-foreground placeholder:text-foreground ${validationErrors.whatsapp ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {validationErrors.whatsapp && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.whatsapp}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="cidade">Cidade <span className="text-destructive" aria-hidden>*</span></Label>
        <div className="relative">
          <Input 
            id="cidade" 
            value={formData.cidade} 
            onChange={e => {
              const value = e.target.value;
              updateFormData('cidade', value);
              if (value) onValidateField('cidade', value);
            }}
            onBlur={e => onValidateField('cidade', e.target.value)}
            autoComplete="address-level2" 
            required 
            readOnly={!!formData.cep}
            className={`h-12 text-base input-surface text-foreground placeholder:text-foreground pr-10 ${validationErrors.cidade ? 'border-red-500 focus:border-red-500' : ''} ${!!formData.cep ? 'cursor-not-allowed opacity-75' : ''}`}
          />
          {formData.cep && (
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {validationErrors.cidade && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.cidade}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="tipo">Tipo de profissional <span className="text-destructive" aria-hidden>*</span></Label>
        <p className="text-sm text-muted-foreground mb-2">Selecione um ou ambos os tipos:</p>
        <ToggleGroup 
          type="multiple" 
          value={formData.tipo_profissional} 
          onValueChange={(value) => {
            updateFormData('tipo_profissional', value);
            updateFormData('categoria_id', "");
          }}
          className={`justify-start gap-2 ${validationErrors.tipo_profissional ? 'border border-red-500 rounded-md p-2' : ''}`}
        >
          <ToggleGroupItem 
            value="prestador" 
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Prestação de Serviço
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="freelancer" 
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Freelancer
          </ToggleGroupItem>
        </ToggleGroup>
        {validationErrors.tipo_profissional && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.tipo_profissional}
          </p>
        )}
      </div>

      {formData.tipo_profissional.length > 0 && (
        <div className="space-y-3">
          <Label htmlFor="categoria">Tipo de serviço <span className="text-destructive" aria-hidden>*</span></Label>
          <Popover open={openCategoria} onOpenChange={setOpenCategoria}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={openCategoria}
                className={`w-full justify-between h-12 input-surface text-foreground ${validationErrors.categoria_id ? 'border-red-500' : ''}`}
              >
                {formData.categoria_id
                  ? (categorias.find(c => c.id === formData.categoria_id)?.nome || 'Selecionado')
                  : 'Selecione o tipo de serviço'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-card text-foreground z-[80]" align="start">
              <Command>
                <CommandInput placeholder="Buscar tipo de serviço..." className="h-10" />
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {categoriasFiltradas.map((categoria) => (
                      <CommandItem
                        key={categoria.id}
                        value={categoria.nome}
                        onSelect={() => {
                          updateFormData('categoria_id', categoria.id);
                          if (!formData.descricao) {
                            const descricao = gerarDescricaoAutomatica(categoria.id, formData.tipo_profissional);
                            updateFormData('descricao', descricao);
                          }
                          setOpenCategoria(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check className={cn("mr-2 h-4 w-4", categoria.id === formData.categoria_id ? "opacity-100" : "opacity-0")} />
                        {categoria.nome}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {validationErrors.categoria_id && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.categoria_id}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea 
          id="descricao" 
          value={formData.descricao} 
          onChange={e => updateFormData('descricao', e.target.value)}
          placeholder="Conte sobre sua experiência e serviços..." 
          rows={4} 
          className="text-base resize-none input-surface text-foreground placeholder:text-foreground" 
        />
      </div>

      {formData.foto_perfil && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Arquivo selecionado: {formData.foto_perfil.name}
          </p>
        </div>
      )}

      <Button type="submit" className="w-full h-12 text-base mt-8" disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </Button>
    </form>
  );
};