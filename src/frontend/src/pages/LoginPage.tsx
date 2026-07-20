import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-users";
import { UserRole } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { HardHat, LogIn, Shield, Wrench } from "lucide-react";
import { useEffect } from "react";

export function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!identity) return;
    if (isLoading) return;
    if (profile) {
      if (profile.role === UserRole.Cliente) {
        navigate({ to: "/cliente" });
      } else {
        navigate({
          to: "/",
          search: { q: undefined, cat: undefined, loc: undefined },
        });
      }
    } else {
      navigate({ to: "/registro" });
    }
  }, [identity, profile, isLoading, navigate]);

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <HardHat className="h-9 w-9" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-3xl text-foreground">
              Busca<span className="text-primary">Oficio</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              La plataforma de oficios en Bolivia
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Bienvenido
            </h2>
            <p className="text-muted-foreground text-sm">
              Inicia sesión con Internet Identity para continuar
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-start gap-2 bg-muted/40 rounded-lg p-3">
              <Wrench className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Trabajadores
                </p>
                <p className="text-xs text-muted-foreground">
                  Encuentra empleos en tu oficio
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-muted/40 rounded-lg p-3">
              <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Clientes
                </p>
                <p className="text-xs text-muted-foreground">
                  Publica y gestiona servicios
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold gap-2"
            onClick={() => login()}
            disabled={isLoggingIn}
            data-ocid="login-btn"
          >
            <LogIn className="h-5 w-5" />
            {isLoggingIn
              ? "Conectando..."
              : "Iniciar sesión con Internet Identity"}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Al iniciar sesión, aceptas nuestros términos de uso.
            <br />
            Tu identidad es privada y segura.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          La Paz, Bolivia · BuscaOficio 2025
        </p>
      </div>
    </div>
  );
}
