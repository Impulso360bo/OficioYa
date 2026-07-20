import { CategoryBadge } from "@/components/CategoryBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApplyForJob,
  useApproveJob,
  useMarkJobComplete,
} from "@/hooks/use-commission";
import { useJob, useJobs } from "@/hooks/use-jobs";
import { useCurrentUser } from "@/hooks/use-users";
import { CATEGORY_LABELS } from "@/types";
import type { Job } from "@/types";
import { JobStatus, UserRole } from "@/types";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Briefcase,
  CheckCircle2,
  CircleDot,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Phone,
  QrCode,
  Star,
  ThumbsUp,
  Wifi,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

/* ─── Helpers ──────────────────────────────────────────────── */

function formatSalary(min: bigint, max: bigint): string {
  const fmt = (n: bigint) =>
    `Bs. ${Number(n).toLocaleString("es-BO", { maximumFractionDigits: 0 })}`;
  return `${fmt(min)} – ${fmt(max)} /mes`;
}

function timeAgo(timestamp: bigint): string {
  const now = Date.now();
  const diff = now - Number(timestamp);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

/** Extract a phone number from a contact string (digits, spaces, dashes, parens, plus) */
function extractPhone(contactInfo: string): string | null {
  const match = contactInfo.match(/[\d\s\-().+]{7,}/);
  return match ? match[0].replace(/\s/g, "") : null;
}

/* ─── Commission Modal ─────────────────────────────────────── */

function CommissionModal({
  open,
  onClose,
  salaryMin,
  salaryMax,
}: {
  open: boolean;
  onClose: () => void;
  salaryMin: bigint;
  salaryMax: bigint;
}) {
  const avgSalary = (Number(salaryMin) + Number(salaryMax)) / 2;
  const commission = avgSalary * 0.2;
  const fmt = (n: number) =>
    `Bs. ${n.toLocaleString("es-BO", { maximumFractionDigits: 0 })}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              data-ocid="commission.dialog"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
                    <QrCode className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2
                      id="commission-modal-title"
                      className="font-display font-bold text-base text-card-foreground leading-tight"
                    >
                      Trabajo completado
                    </h2>
                    <p className="text-xs text-muted-foreground font-body">
                      Paga tu comisión al trabajador
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar modal"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  data-ocid="commission.close_button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Commission amount */}
              <div className="px-6 py-4 bg-accent/5 border-b border-border">
                <p className="text-xs text-muted-foreground font-body mb-1">
                  Comisión a pagar (20% del salario)
                </p>
                <p
                  className="font-display font-bold text-2xl text-accent"
                  data-ocid="commission.amount"
                >
                  {fmt(commission)}
                </p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  Salario promedio: {fmt(avgSalary)}
                </p>
              </div>

              {/* QR Code */}
              <div className="px-6 py-5 flex flex-col items-center gap-4">
                <div className="rounded-xl border-2 border-border bg-background p-3 shadow-inner">
                  <img
                    src="/assets/images/altoke-qr.png"
                    alt="Código QR Altoke para pagar comisión"
                    className="h-48 w-48 object-contain rounded-lg"
                    data-ocid="commission.qr_image"
                  />
                </div>

                <div className="w-full rounded-lg bg-muted/50 border border-border p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground font-body text-center">
                    Instrucciones de pago
                  </p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed text-center">
                    Escanea este QR con tu app bancaria o billetera digital para
                    pagar la comisión de tu trabajo.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground font-body">
                      CTA:
                    </span>
                    <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-semibold text-foreground select-all">
                      1794405-000-001
                    </code>
                  </div>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full gap-2"
                  data-ocid="commission.confirm_button"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Entendido
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Status badge ─────────────────────────────────────── */

const STATUS_CONFIG: Record<
  JobStatus,
  {
    label: string;
    className: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  [JobStatus.Posted]: {
    label: "Disponible",
    className: "bg-muted text-muted-foreground border-border",
    Icon: CircleDot,
  },
  [JobStatus.InProgress]: {
    label: "En Progreso",
    className: "bg-secondary/15 text-secondary border-secondary/30",
    Icon: Loader2,
  },
  [JobStatus.PendingApproval]: {
    label: "Esperando Aprobación",
    className: "bg-accent/15 text-accent border-accent/30",
    Icon: Clock,
  },
  [JobStatus.Completed]: {
    label: "Completado",
    className: "bg-primary/15 text-primary border-primary/30",
    Icon: CheckCircle2,
  },
  [JobStatus.Cancelled]: {
    label: "Cancelado",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    Icon: XCircle,
  },
};

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[JobStatus.Posted];
  const { Icon, label, className } = cfg;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold font-body ${className}`}
      data-ocid="job-status-badge"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/* ─── Action buttons panel ─────────────────────────────── */

function JobActions({ job }: { job: Job }) {
  const { profile } = useCurrentUser();
  const applyMutation = useApplyForJob();
  const completeMutation = useMarkJobComplete();
  const approveMutation = useApproveJob();
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  const status = job.jobStatus;
  if (!status || !profile) return null;

  const isWorker = profile.role === UserRole.Trabajador;
  const isClient = profile.role === UserRole.Cliente;
  const myPrincipal = profile.id.toText?.() ?? profile.id.toString();
  const isAssignedWorker =
    job.assignedWorker != null &&
    (typeof job.assignedWorker === "object"
      ? (job.assignedWorker as { toText?: () => string }).toText?.() ===
          myPrincipal || job.assignedWorker.toString() === myPrincipal
      : job.assignedWorker === myPrincipal);
  const isPoster =
    job.postedBy != null &&
    (typeof job.postedBy === "object"
      ? (job.postedBy as { toText?: () => string }).toText?.() ===
          myPrincipal || job.postedBy.toString() === myPrincipal
      : job.postedBy === myPrincipal);

  const canApply = isWorker && status === JobStatus.Posted && !isAssignedWorker;
  const canComplete =
    isWorker && status === JobStatus.InProgress && isAssignedWorker;
  const canApprove =
    isClient && status === JobStatus.PendingApproval && isPoster;

  if (!canApply && !canComplete && !canApprove) return null;

  return (
    <>
      <div
        className="rounded-lg border border-border bg-card p-5 shadow-md space-y-3"
        data-ocid="job-actions-panel"
      >
        <h2 className="font-display font-semibold text-base text-card-foreground">
          Acciones del trabajo
        </h2>

        {canApply && (
          <Button
            className="w-full gap-2"
            data-ocid="apply-job-button"
            disabled={applyMutation.isPending}
            onClick={() => {
              applyMutation.mutate(BigInt(job.id), {
                onSuccess: () =>
                  toast.success(
                    "Aplicación enviada. El trabajo ahora está en progreso.",
                  ),
                onError: (err) => toast.error(err.message),
              });
            }}
          >
            {applyMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Briefcase className="h-4 w-4" />
            )}
            Aplicar al trabajo
          </Button>
        )}

        {canComplete && (
          <Button
            className="w-full gap-2"
            variant="outline"
            data-ocid="complete-job-button"
            disabled={completeMutation.isPending}
            onClick={() => {
              completeMutation.mutate(BigInt(job.id), {
                onSuccess: () =>
                  toast.success(
                    "Trabajo marcado como finalizado. Esperando aprobación del cliente.",
                  ),
                onError: (err) => toast.error(err.message),
              });
            }}
          >
            {completeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Marcar como Finalizado
          </Button>
        )}

        {canApprove && (
          <Button
            className="w-full gap-2"
            data-ocid="approve-job-button"
            disabled={approveMutation.isPending}
            onClick={() => {
              approveMutation.mutate(BigInt(job.id), {
                onSuccess: () => {
                  toast.success(
                    "Trabajo aprobado. La comisión del trabajador ha sido descontada.",
                  );
                  setShowCommissionModal(true);
                },
                onError: (err) => toast.error(err.message),
              });
            }}
          >
            {approveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className="h-4 w-4" />
            )}
            Aprobar trabajo
          </Button>
        )}
      </div>

      <CommissionModal
        open={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        salaryMin={job.salaryMin}
        salaryMax={job.salaryMax}
      />
    </>
  );
}

/* ─── Sub-components ───────────────────────────────────────── */

function InfoRow({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon
          className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`}
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-body">{label}</p>
        <p
          className={`text-sm font-medium font-body ${accent ? "text-primary" : "text-foreground"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Loading skeleton ────────────────────────────────────── */

function JobDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-5 w-36 mb-6" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Header card */}
          <div className="job-card space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <Separator />
            <div className="grid sm:grid-cols-2 gap-1">
              {(["loc", "sal", "pub", "mod"] as const).map((k) => (
                <div key={k} className="flex gap-3 py-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Description */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          {/* Requirements */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        {/* Sidebar */}
        <div>
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Related job card ─────────────────────────────────────── */

function RelatedJobCard({ job }: { job: Job }) {
  return (
    <Link to="/jobs/$id" params={{ id: job.id.toString() }}>
      <Card className="group h-full border-border bg-card hover:shadow-md hover:border-primary/40 transition-smooth cursor-pointer">
        <CardContent className="p-4 flex flex-col gap-2 h-full">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-sm font-semibold text-card-foreground leading-snug line-clamp-2 flex-1 group-hover:text-primary transition-colors">
              {job.title}
            </p>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-auto pt-2">
            <CategoryBadge category={job.category} size="sm" />
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
          </div>
          <p className="text-xs font-medium text-primary font-body">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ─── Main detail view ────────────────────────────────────── */

function JobDetail({ job }: { job: Job }) {
  const search = useSearch({ strict: false });
  const isEmail = job.contactInfo.includes("@");
  const phoneNumber = extractPhone(job.contactInfo);
  const isPhone = !!phoneNumber && !isEmail;

  const { data: relatedData } = useJobs({ category: job.category });
  const relatedJobs = (relatedData?.pages.flatMap((p) => p.items) ?? [])
    .filter((j) => j.id !== job.id)
    .slice(0, 3);

  const backSearch = {
    q: search.q,
    cat: search.cat ?? job.category,
    loc: search.loc,
  };

  // Build WhatsApp URL
  const rawPhone = extractPhone(job.contactInfo);
  const whatsappUrl = rawPhone
    ? `https://wa.me/${rawPhone.replace(/[^+\d]/g, "")}`
    : "https://wa.me/";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/"
          search={backSearch}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body mb-6 group"
          data-ocid="back-to-listing"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Volver a empleos
        </Link>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Left column ── */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header card */}
          <div className="job-card" data-ocid="job-header-card">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-card-foreground leading-snug mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={job.category} size="md" />
                  {job.jobStatus && <StatusBadge status={job.jobStatus} />}
                </div>
              </div>
              {job.isRemote && (
                <span className="flex items-center gap-1.5 rounded-full bg-accent/15 text-accent border border-accent/30 px-3 py-1 text-xs font-medium">
                  <Wifi className="h-3.5 w-3.5" />
                  Trabajo Remoto
                </span>
              )}
            </div>

            <Separator className="my-4" />

            <div className="grid sm:grid-cols-2 gap-1 divide-y divide-border">
              <InfoRow
                icon={MapPin}
                label="Ciudad / Ubicación"
                value={job.location}
              />
              <InfoRow
                icon={Banknote}
                label="Salario mensual"
                value={formatSalary(job.salaryMin, job.salaryMax)}
                accent
              />
              <InfoRow
                icon={Clock}
                label="Publicado"
                value={timeAgo(job.postedDate)}
              />
              <InfoRow
                icon={Briefcase}
                label="Modalidad"
                value={job.isRemote ? "Remoto" : "Presencial"}
              />
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold text-lg text-card-foreground">
                Descripción del puesto
              </h2>
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold text-lg text-card-foreground">
                Requisitos
              </h2>
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed whitespace-pre-line">
              {job.requirements}
            </p>
          </div>

          {/* Related jobs */}
          {relatedJobs.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              data-ocid="related-jobs"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-base text-foreground">
                  Otros empleos de{" "}
                  <span className="text-primary">
                    {CATEGORY_LABELS[job.category]}
                  </span>
                </h2>
                <Link
                  to="/"
                  search={{ q: undefined, cat: job.category, loc: undefined }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors font-body"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {relatedJobs.map((related, i) => (
                  <motion.div
                    key={related.id.toString()}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + i * 0.07 }}
                  >
                    <RelatedJobCard job={related} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </motion.div>

        {/* ── Right column: contact sidebar ── */}
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Job action buttons (role-aware) */}
          <JobActions job={job} />
          <div
            className="sticky top-24 rounded-lg border border-border bg-card p-5 shadow-md"
            data-ocid="contact-sidebar"
          >
            <h2 className="font-display font-semibold text-base text-card-foreground mb-4">
              Contactar al empleador
            </h2>

            <div className="rounded-md bg-muted/50 border border-border p-4 mb-4">
              <p className="text-xs text-muted-foreground font-body mb-1">
                Información de contacto
              </p>
              <p className="text-sm font-medium text-foreground font-body break-words">
                {job.contactInfo}
              </p>
            </div>

            {/* WhatsApp button — always shown, uses phone if available */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block mb-2"
              data-ocid="contact-whatsapp"
            >
              <Button
                className="w-full gap-2 font-semibold"
                style={{
                  backgroundColor: "#25D366",
                  color: "#fff",
                  borderColor: "#25D366",
                }}
              >
                {/* WhatsApp SVG icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Mandar WhatsApp
              </Button>
            </a>

            {/* Phone call button — shown when phone detected */}
            {isPhone && phoneNumber && (
              <a
                href={`tel:${phoneNumber}`}
                className="w-full block mb-2"
                data-ocid="contact-phone"
              >
                <Button variant="outline" className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  Llamar ahora
                </Button>
              </a>
            )}

            <p className="mt-4 text-xs text-muted-foreground font-body text-center leading-relaxed">
              Al contactar, menciona que encontraste esta oferta en{" "}
              <span className="text-primary font-medium">BuscaOficio</span>.
            </p>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

/* ─── Page export ──────────────────────────────────────────── */

export function JobDetailPage() {
  const { id } = useParams({ from: "/jobs/$id" });
  const { data: job, isLoading } = useJob(id);

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/"
          search={{ q: undefined, cat: undefined, loc: undefined }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body mb-6"
          data-ocid="back-to-listing-error"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a empleos
        </Link>
        <EmptyState type="general" />
      </div>
    );
  }

  return <JobDetail job={job} />;
}
