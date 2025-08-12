import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Zap, Star, CheckCircle } from "lucide-react";

interface HeroSectionProps {
  navigating: boolean;
  onNavigation: (path: string) => void;
}

export const HeroSection = ({ navigating, onNavigation }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Conecte-se com os 
            <span className="text-gradient-hero"> melhores profissionais</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Encontre freelancers e prestadores de serviços qualificados de maneira rápido e fácil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gradient-primary text-white border-0 px-8 py-4 text-lg"
              onClick={() => onNavigation('/auth')}
              disabled={navigating}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Cadastre-se Gratuitamente
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg" 
              onClick={() => document.getElementById('profissionais')?.scrollIntoView({
                behavior: 'smooth'
              })}
            >
              <Search className="w-5 h-5 mr-2" />
              Explorar Profissionais
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="gradient-card border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Facilidade na Busca</h3>
              <p className="text-sm text-muted-foreground">
                Encontre profissionais rapidamente com nossos filtros inteligentes
              </p>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Conexão Instantânea</h3>
              <p className="text-sm text-muted-foreground">
                Entre em contato direto via WhatsApp com apenas um clique
              </p>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Melhor Qualidade</h3>
              <p className="text-sm text-muted-foreground">
                Encontre os melhores talentos em diversas categorias profissionais
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};