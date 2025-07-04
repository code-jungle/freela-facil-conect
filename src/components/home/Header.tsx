import { Button } from "@/components/ui/button";
import { User, LogOut, Zap } from "lucide-react";

interface HeaderProps {
  user: any;
  navigating: boolean;
  onNavigation: (path: string) => void;
  onLogout: () => void;
}

export const Header = ({ user, navigating, onNavigation, onLogout }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FreelaFácil
            </h1>
          </div>
          <div className="flex gap-2">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onNavigation('/profile')}
                  disabled={navigating}
                >
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onLogout}
                  disabled={navigating}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Button 
                className="gradient-primary text-white border-0"
                onClick={() => onNavigation('/auth')}
                disabled={navigating}
              >
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};