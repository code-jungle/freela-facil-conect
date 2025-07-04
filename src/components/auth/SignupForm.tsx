import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone } from "@/utils/validation";
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
    telefone: "",
    whatsapp: "",
    cidade: "",
    tipo_profissional: "",
    categoria_id: "",
    descricao: "",
    foto_perfil: null
  });

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
          <Label htmlFor="telefone">Telefone</Label>
          <Input 
            id="telefone" 
            value={formData.telefone} 
            onChange={e => {
              const value = formatPhone(e.target.value);
              updateFormData('telefone', value);
              if (value) onValidateField('telefone', value);
            }}
            onBlur={e => onValidateField('telefone', e.target.value)}
            placeholder="(11) 99999-9999" 
            inputMode="tel" 
            autoComplete="tel" 
            required 
            className={`h-12 text-base bg-gray-100 ${validationErrors.telefone ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {validationErrors.telefone && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.telefone}
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
            }}
            placeholder="Opcional" 
            inputMode="tel" 
            className="h-12 text-base bg-gray-100"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="cidade">Cidade</Label>
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
          className={`h-12 text-base bg-gray-100 ${validationErrors.cidade ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        {validationErrors.cidade && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.cidade}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="tipo">Tipo de profissional</Label>
        <Select 
          value={formData.tipo_profissional} 
          onValueChange={value => {
            updateFormData('tipo_profissional', value);
            updateFormData('categoria_id', "");
          }} 
          required
        >
          <SelectTrigger className={`h-12 text-base text-slate-900 bg-gray-100 ${validationErrors.tipo_profissional ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="freelancer">Freelancer</SelectItem>
            <SelectItem value="prestador">Prestador de Serviço</SelectItem>
          </SelectContent>
        </Select>
        {validationErrors.tipo_profissional && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.tipo_profissional}
          </p>
        )}
      </div>

      {formData.tipo_profissional && (
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
            <SelectTrigger className={`h-12 text-base ${validationErrors.categoria_id ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
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
      )}

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