import { cn } from "@/lib/utils";
import type { Job } from "@/types";
import { Link } from "@tanstack/react-router";
import { Banknote, Clock, MapPin, Wifi } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";

interface JobCardProps {
  job: Job;
  className?: string;
}

function formatSalary(min: bigint, max: bigint): string {
  const fmt = (n: bigint) =>
    `Bs. ${Number(n).toLocaleString("es-BO", { maximumFractionDigits: 0 })}`;
  return `${fmt(min)} – ${fmt(max)}`;
}

function timeAgo(timestamp: bigint): string {
  const now = Date.now();
  const posted = Number(timestamp);
  const diff = now - posted;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

export function JobCard({ job, className }: JobCardProps) {
  return (
    <Link
      to="/jobs/$id"
      params={{ id: job.id.toString() }}
      className={cn(
        "job-card block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      data-ocid="job-card"
    >
      <div className="flex flex-col gap-3">
        {/* Title + badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug">
            {job.title}
          </h3>
          <CategoryBadge
            category={job.category}
            size="sm"
            className="shrink-0 mt-0.5"
          />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-body">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.location}</span>
          </span>
          {job.isRemote && (
            <span className="flex items-center gap-1 text-accent">
              <Wifi className="h-3.5 w-3.5 shrink-0" />
              Remoto
            </span>
          )}
          <span className="flex items-center gap-1 text-primary font-medium">
            <Banknote className="h-3.5 w-3.5 shrink-0" />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-sm text-muted-foreground font-body line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {timeAgo(job.postedDate)}
          </span>
          <span className="text-xs font-medium text-primary group-hover:underline font-body">
            Ver detalle →
          </span>
        </div>
      </div>
    </Link>
  );
}
