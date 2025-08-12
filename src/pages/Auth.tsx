import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm, SignupForm } from "@/components/auth";

const Auth = () => {
  const {
    loading,
    validationErrors,
    connectionError,
    handleLogin,
    handleSignup,
    validateField
  } = useAuth();

  // Check if user is already logged in (optional - can be removed if not needed)
  useEffect(() => {
    // Any initialization logic can go here
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-4">
      <div className="w-full max-w-lg sm:max-w-md">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-12 px-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">FreelaFácil</CardTitle>
            <CardDescription>
              Área do profissional
            </CardDescription>
          </CardHeader>

          <CardContent>
            {connectionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Problema de conexão detectado</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Verifique sua internet. Os dados serão salvos localmente.
                </p>
              </div>
            )}
            
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm 
                  onSubmit={handleLogin}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="signup">
                <SignupForm
                  onSubmit={handleSignup}
                  loading={loading}
                  validationErrors={validationErrors}
                  onValidateField={validateField}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;