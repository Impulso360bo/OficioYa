import { ProfileStatus } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatBalance,
  getBalanceState,
  useWorkerBalance,
} from "@/hooks/use-commission";
import { useCurrentUser, useUpdateProfile } from "@/hooks/use-users";
import {
  BOLIVIA_CITIES_ORDER,
  BOLIVIA_CITY_LABELS,
  BoliviaCity,
  UserRole,
} from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  Check,
  Edit2,
  Mail,
  MapPin,
  Phone,
  QrCode,
  TrendingDown,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Balance Panel ────────────────────────────────────────────────────────────

function BalancePanel({
  balance,
  profileStatus,
}: { balance: number; profileStatus: ProfileStatus }) {
  const state = getBalanceState(balance);
  const isSuspended = profileStatus === ProfileStatus.Suspended;

  const balanceColorClass =
    state === "suspended" || isSuspended
      ? "text-destructive"
      : state === "warning"
        ? "text-primary"
        : "text-accent";

  return (
    <div className="space-y-4 mt-4" data-ocid="commission.panel">
      {/* Suspension Alert Banner */}
      {isSuspended && (
        <div
          className="suspension-alert"
          data-ocid="commission.suspension_alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="suspension-alert-title">
                Perfil suspendido — invisible para los clientes
              </p>
              <p className="suspension-alert-text">
                Tu balance ha alcanzado el límite de deuda de{" "}
                <strong>-100 Bs.</strong> Tu perfil está oculto y no recibirás
                nuevos pedidos hasta que recargues tu balance. Para reactivarte,
                escanea el código QR de recarga y añade fondos suficientes para
                superar los -100 Bs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning banner (balance between -50 and -100) */}
      {!isSuspended && state === "warning" && (
        <div
          className="bg-primary/10 border border-primary/30 rounded-lg p-4"
          data-ocid="commission.warning_alert"
        >
          <div className="flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-primary text-xs leading-relaxed">
              Tu balance está bajo. Si llega a <strong>-100 Bs.</strong> tu
              perfil se suspenderá automáticamente. Recarga pronto para evitar
              interrupciones.
            </p>
          </div>
        </div>
      )}

      {/* Balance Card */}
      <div
        className={`balance-panel ${isSuspended || state === "suspended" ? "suspended" : state}`}
        data-ocid="commission.balance_card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-display font-bold text-base text-foreground">
            Balance de Comisiones
          </h2>
          <span
            className={`ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isSuspended
                ? "bg-destructive/15 text-destructive"
                : state === "warning"
                  ? "bg-primary/15 text-primary"
                  : "bg-accent/15 text-accent"
            }`}
            data-ocid="commission.status_badge"
          >
            {isSuspended
              ? "Suspendido"
              : state === "warning"
                ? "Atención"
                : "Activo"}
          </span>
        </div>

        {/* Current balance display */}
        <div className="flex items-end gap-2 mb-4">
          <span
            className={`font-display font-bold text-3xl ${balanceColorClass}`}
            data-ocid="commission.balance_value"
          >
            {formatBalance(balance)}
          </span>
          <span className="text-muted-foreground text-sm mb-1">
            balance actual
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="commission-stat">
            <span className="commission-stat-value">20%</span>
            <span className="commission-stat-label">Comisión por trabajo</span>
          </div>
          <div className="commission-stat">
            <span className="commission-stat-value text-destructive">
              -100 Bs.
            </span>
            <span className="commission-stat-label">Límite de suspensión</span>
          </div>
        </div>

        {/* Informational message */}
        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 rounded-md p-3">
          Tu balance actual es de{" "}
          <strong className={balanceColorClass}>
            {formatBalance(balance)}
          </strong>
          . Recuerda que cobramos el <strong>20%</strong> por cada trabajo. Si
          tu deuda llega a <strong>-100 Bs.</strong>, tu perfil se pausará
          automáticamente.
        </p>
      </div>

      {/* QR Recharge Section */}
      <div className="qr-card" data-ocid="commission.qr_section">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-display font-semibold text-sm text-foreground">
            Código QR de Recarga
          </h3>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div
            className="rounded-xl border-2 border-border bg-background p-2 shadow-inner"
            data-ocid="commission.qr_placeholder"
          >
            <img
              src="/assets/images/altoke-qr.png"
              alt="Código QR Altoke para recargar balance"
              className="h-28 w-28 object-contain rounded-lg"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-medium text-foreground mb-1">
              Recarga tu balance
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
              Escanea este QR con tu app bancaria o billetera digital para
              recargar tu balance.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-body">
                CTA:
              </span>
              <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-semibold text-foreground select-all">
                1794405-000-001
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentUser();
  const updateMutation = useUpdateProfile();
  const { balance, isLoading: balanceLoading } = useWorkerBalance();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: BoliviaCity.LaPaz,
  });

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  useEffect(() => {
    if (!isLoading && !profile && identity) {
      navigate({ to: "/registro" });
    }
  }, [profile, isLoading, identity, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, phone: profile.phone, city: profile.city });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city,
      });
      toast.success("Perfil actualizado correctamente.");
      setEditing(false);
    } catch {
      toast.error("Error al actualizar el perfil. Intenta nuevamente.");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({ name: profile.name, phone: profile.phone, city: profile.city });
    }
    setEditing(false);
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts / 1_000_000n)).toLocaleDateString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background py-10 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isWorker = profile.role === UserRole.Trabajador;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-2xl text-foreground">
            Mi Perfil
          </h1>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-2"
              data-ocid="btn-edit-profile"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <div className="profile-card mb-4" data-ocid="profile-card">
          {/* Avatar + role */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-foreground">
                {profile.name}
              </p>
              <span
                className={`role-badge ${profile.role === UserRole.Trabajador ? "trabajador" : "cliente"}`}
              >
                {profile.role === UserRole.Trabajador
                  ? "Trabajador"
                  : "Cliente"}
              </span>
            </div>
          </div>

          {/* Info fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <p className="form-label flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> Nombre
                Completo
              </p>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  data-ocid="edit-name"
                />
              ) : (
                <p className="text-foreground px-1">{profile.name}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <p className="form-label flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> Correo
                Electrónico
              </p>
              <p className="text-foreground px-1">{profile.email}</p>
            </div>

            {/* Phone */}
            <div>
              <p className="form-label flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> Número de
                Teléfono
              </p>
              {editing ? (
                <input
                  type="tel"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  data-ocid="edit-phone"
                />
              ) : (
                <p className="text-foreground px-1">{profile.phone}</p>
              )}
            </div>

            {/* City */}
            <div>
              <p className="form-label flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Ciudad
              </p>
              {editing ? (
                <select
                  className="form-select"
                  value={form.city}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      city: e.target.value as BoliviaCity,
                    }))
                  }
                  data-ocid="edit-city"
                >
                  {BOLIVIA_CITIES_ORDER.map((city) => (
                    <option key={city} value={city}>
                      {BOLIVIA_CITY_LABELS[city]}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-foreground px-1">
                  {BOLIVIA_CITY_LABELS[profile.city]}, Bolivia
                </p>
              )}
            </div>

            {/* Registration date */}
            <div>
              <p className="form-label flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Miembro
                desde
              </p>
              <p className="text-muted-foreground px-1 text-sm">
                {formatDate(profile.registeredAt)}
              </p>
            </div>
          </div>

          {/* Edit action buttons */}
          {editing && (
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 gap-2"
                data-ocid="btn-save-profile"
              >
                <Check className="h-4 w-4" />
                {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="gap-2"
                data-ocid="btn-cancel-edit"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* Balance Panel — workers only */}
        {isWorker &&
          (balanceLoading ? (
            <div
              className="space-y-3 mt-4"
              data-ocid="commission.loading_state"
            >
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          ) : (
            <BalancePanel
              balance={balance}
              profileStatus={profile.profileStatus}
            />
          ))}
      </div>
    </div>
  );
}
