import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-users";
import { UserRole } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Building2, Clock } from "lucide-react";
import { useEffect } from "react";

export function ClientPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  useEffect(() => {
    if (!isLoading && !profile && identity) {
      navigate({ to: "/registro" });
    }
  }, [profile, isLoading, identity, navigate]);

  if (isLoading || !profile) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/10 border-2 border-secondary/30">
            <Building2 className="h-10 w-10 text-secondary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-3xl text-foreground mb-3">
          Panel de Cliente
        </h1>
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
          <Clock className="h-4 w-4" />
          Próximamente
        </div>

        <p className="text-muted-foreground text-base leading-relaxed mb-3 max-w-md mx-auto">
          Hola,{" "}
          <span className="font-semibold text-foreground">{profile.name}</span>.
          Estamos preparando tu panel de cliente para que puedas publicar
          solicitudes y gestionar tus servicios fácilmente.
        </p>
        <p className="text-muted-foreground text-sm mb-10">
          Muy pronto tendrás acceso a publicar requerimientos, recibir
          propuestas y contratar trabajadores verificados en Bolivia.
        </p>

        {/* Features coming */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
          {[
            {
              icon: Briefcase,
              title: "Publicar Trabajos",
              desc: "Crea solicitudes de servicio para tu hogar o empresa",
            },
            {
              icon: Building2,
              title: "Gestionar Contratos",
              desc: "Sigue el estado de cada trabajo contratado",
            },
            {
              icon: Clock,
              title: "Historial de Servicios",
              desc: "Revisa todos tus servicios anteriores y calificaciones",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold text-sm text-foreground mb-1">
                {title}
              </p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link to="/" search={{ q: undefined, cat: undefined, loc: undefined }}>
          <Button
            variant="outline"
            className="gap-2"
            data-ocid="btn-browse-jobs"
          >
            <ArrowRight className="h-4 w-4" />
            Explorar listado de empleos
          </Button>
        </Link>
      </div>
    </div>
  );
}
