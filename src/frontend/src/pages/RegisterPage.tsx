import { Button } from "@/components/ui/button";
import { useCurrentUser, useRegisterUser } from "@/hooks/use-users";
import {
  BOLIVIA_CITIES_ORDER,
  BOLIVIA_CITY_LABELS,
  BoliviaCity,
  UserRole,
} from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { Building2, HardHat, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FormState {
  name: string;
  email: string;
  phone: string;
  city: BoliviaCity;
  role: UserRole;
}

export function RegisterPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentUser();
  const registerMutation = useRegisterUser();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    city: BoliviaCity.LaPaz,
    role: UserRole.Trabajador,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  // If not logged in, redirect to login
  useEffect(() => {
    if (!identity) {
      navigate({ to: "/login" });
    }
  }, [identity, navigate]);

  // If already registered, redirect appropriately
  useEffect(() => {
    if (!isLoading && profile) {
      if (profile.role === UserRole.Cliente) {
        navigate({ to: "/cliente" });
      } else {
        navigate({
          to: "/",
          search: { q: undefined, cat: undefined, loc: undefined },
        });
      }
    }
  }, [profile, isLoading, navigate]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = "El nombre es requerido.";
    else if (form.name.trim().length < 2)
      newErrors.name = "Ingresa tu nombre completo.";

    if (!form.email.trim())
      newErrors.email = "El correo electrónico es requerido.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Ingresa un correo electrónico válido.";

    if (!form.phone.trim())
      newErrors.phone = "El número de teléfono es requerido.";
    else if (!/^[\d\s\+\-\(\)]{6,15}$/.test(form.phone))
      newErrors.phone = "Ingresa un número de teléfono válido.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const profile = await registerMutation.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city,
        role: form.role,
      });

      toast.success("¡Registro exitoso! Bienvenido a BuscaOficio.");

      if (profile.role === UserRole.Cliente) {
        navigate({ to: "/cliente" });
      } else {
        navigate({
          to: "/",
          search: { q: undefined, cat: undefined, loc: undefined },
        });
      }
    } catch {
      toast.error("Error al registrarse. Por favor intenta nuevamente.");
    }
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-10 px-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <HardHat className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-foreground">
              Registro de Usuario
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              ¿Cómo quieres unirte a nosotros? Selecciona tu rol para comenzar.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
            {/* Role Selection */}
            <div>
              <p className="form-label">Selecciona tu rol</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setField("role", UserRole.Trabajador)}
                  className={`role-card flex flex-col items-center gap-3 p-4 text-center ${form.role === UserRole.Trabajador ? "active" : ""}`}
                  data-ocid="role-trabajador"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${form.role === UserRole.Trabajador ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} transition-smooth`}
                  >
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      Soy Trabajador
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (Busco Empleo)
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setField("role", UserRole.Cliente)}
                  className={`role-card flex flex-col items-center gap-3 p-4 text-center ${form.role === UserRole.Cliente ? "active" : ""}`}
                  data-ocid="role-cliente"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${form.role === UserRole.Cliente ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} transition-smooth`}
                  >
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      Soy Cliente
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (Busco Servicios)
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="form-label">
                Nombre Completo
              </label>
              <input
                id="reg-name"
                type="text"
                className={`form-input ${errors.name ? "border-destructive focus:ring-destructive/40" : ""}`}
                placeholder="Ej: Alejandro Flores"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                autoComplete="name"
                data-ocid="input-name"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="form-label">
                Correo Electrónico
              </label>
              <input
                id="reg-email"
                type="email"
                className={`form-input ${errors.email ? "border-destructive focus:ring-destructive/40" : ""}`}
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                autoComplete="email"
                data-ocid="input-email"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="form-label">
                Número de Teléfono
              </label>
              <input
                id="reg-phone"
                type="tel"
                className={`form-input ${errors.phone ? "border-destructive focus:ring-destructive/40" : ""}`}
                placeholder="+591 70000000"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                autoComplete="tel"
                data-ocid="input-phone"
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">{errors.phone}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="reg-city" className="form-label">
                Ciudad en Bolivia
              </label>
              <select
                id="reg-city"
                className="form-select"
                value={form.city}
                onChange={(e) =>
                  setField("city", e.target.value as BoliviaCity)
                }
                data-ocid="select-city"
              >
                {BOLIVIA_CITIES_ORDER.map((city) => (
                  <option key={city} value={city}>
                    {BOLIVIA_CITY_LABELS[city]}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={registerMutation.isPending}
              data-ocid="submit-register"
            >
              {registerMutation.isPending ? "Registrando..." : "Continuar →"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
