import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone } from "@/utils/validation";
import { buscarCep, formatCep } from "@/utils/cepService";
import type { Categoria, SignupFormData, ValidationErrors } from "@/components/auth/types";

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
    tipo_profissional: "",
    categoria_id: "",
    descricao: "",
    foto_perfil: null
  });
  const [cepLoading, setCepLoading] = useState(false);

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

  const categoriasFiltradas = formData.tipo_profissional 
    ? categorias.filter(c => c.tipo_profissional === formData.tipo_profissional) 
    : [];

  const gerarDescricaoAutomatica = (categoria: string, tipo: string) => {
    const categoria_obj = categorias.find(c => c.id === categoria);
    if (!categoria_obj) return "";
    const tipoTexto = tipo === 'freelancer' ? 'freelancer' : 'prestador de serviços';
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
          <Label htmlFor="signup-email">Email</Label>
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
            className={`h-12 text-base bg-gray-100 ${validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="signup-password">Senha</Label>
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
            className={`h-12 text-base bg-gray-100 ${validationErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
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
        <Label htmlFor="nome">Nome completo</Label>
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
          className={`h-12 text-base bg-gray-100 ${validationErrors.nome ? 'border-red-500 focus:border-red-500' : ''}`}
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
          <Label htmlFor="cep">CEP</Label>
          <div className="relative">
            <Input 
              id="cep" 
              value={formData.cep} 
              onChange={e => handleCepChange(e.target.value)}
              placeholder="00000-000" 
              inputMode="numeric" 
              maxLength={9}
              required 
              className={`h-12 text-base bg-gray-100 pr-10 ${validationErrors.cep ? 'border-red-500 focus:border-red-500' : ''}`}
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
          <Label htmlFor="whatsapp">WhatsApp</Label>
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
            className={`h-12 text-base bg-gray-100 ${validationErrors.whatsapp ? 'border-red-500 focus:border-red-500' : ''}`}
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
        <Label htmlFor="cidade">Cidade</Label>
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
            className={`h-12 text-base bg-gray-100 pr-10 ${validationErrors.cidade ? 'border-red-500 focus:border-red-500' : ''} ${!!formData.cep ? 'cursor-not-allowed opacity-75' : ''}`}
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

      <div className="space-y-4">
        <Label>Tipo de profissional</Label>
        <Tabs 
          value={formData.tipo_profissional} 
          onValueChange={value => {
            updateFormData('tipo_profissional', value);
            updateFormData('categoria_id', "");
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="prestador" className="h-10">Prestação de Serviço</TabsTrigger>
            <TabsTrigger value="freelancer" className="h-10">Freelancer</TabsTrigger>
          </TabsList>
          
          {formData.tipo_profissional && (
            <TabsContent value={formData.tipo_profissional} className="mt-4">
              <div className="space-y-3">
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={formData.categoria_id} 
                  onValueChange={value => {
                    updateFormData('categoria_id', value);
                    // Gerar descrição automática
                    if (value && !formData.descricao) {
                      const descricao = gerarDescricaoAutomatica(value, formData.tipo_profissional);
                      updateFormData('descricao', descricao);
                    }
                  }} 
                  required
                >
                  <SelectTrigger className={`h-12 text-base bg-gray-100 ${validationErrors.categoria_id ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categoriasFiltradas.map(categoria => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.categoria_id && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.categoria_id}
                  </p>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
        {validationErrors.tipo_profissional && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.tipo_profissional}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea 
          id="descricao" 
          value={formData.descricao} 
          onChange={e => updateFormData('descricao', e.target.value)}
          placeholder="Conte sobre sua experiência e serviços..." 
          rows={4} 
          className="text-base resize-none bg-gray-100" 
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