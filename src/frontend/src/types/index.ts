import { BoliviaCity, JobStatus, ProfileStatus, UserRole } from "../backend.d";
import type {
  JobId,
  JobView,
  RegisterRequest,
  UpdateProfileRequest,
  UserId,
  UserProfile,
} from "../backend.d";

export { BoliviaCity, UserRole, JobStatus, ProfileStatus };
export type {
  UserProfile,
  RegisterRequest,
  UpdateProfileRequest,
  JobView,
  UserId,
  JobId,
};

export type Category =
  | "Albanil"
  | "Carpintero"
  | "Pintor"
  | "Electricista"
  | "Plomero"
  | "Soldador"
  | "Jardinero"
  | "Mecanico"
  | "Otros";

export interface Job {
  id: bigint;
  title: string;
  category: Category;
  location: string;
  salaryMin: bigint;
  salaryMax: bigint;
  description: string;
  requirements: string;
  contactInfo: string;
  postedDate: bigint;
  isRemote: boolean;
  jobStatus?: JobStatus;
  assignedWorker?: UserId;
  postedBy?: UserId;
}

export interface PageRequest {
  offset: bigint;
  limit: bigint;
}

export interface PageResult<T> {
  items: T[];
  total: bigint;
  offset: bigint;
  limit: bigint;
}

export interface SearchParams {
  query: string;
  category: Category | "Todas";
  location: string;
  isRemote: boolean | null;
}

export const CATEGORY_LABELS: Record<Category | "Todas", string> = {
  Todas: "Todas las categorías",
  Albanil: "Albañil",
  Carpintero: "Carpintero",
  Pintor: "Pintor",
  Electricista: "Electricista",
  Plomero: "Plomero",
  Soldador: "Soldador",
  Jardinero: "Jardinero",
  Mecanico: "Mecánico",
  Otros: "Otros",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Albanil: "bg-primary/15 text-primary border-primary/30",
  Carpintero: "bg-secondary/15 text-secondary border-secondary/30",
  Pintor: "bg-accent/15 text-accent border-accent/30",
  Electricista: "bg-primary/10 text-primary border-primary/20",
  Plomero: "bg-muted text-muted-foreground border-border",
  Soldador: "bg-destructive/10 text-destructive border-destructive/20",
  Jardinero: "bg-accent/10 text-accent border-accent/20",
  Mecanico: "bg-secondary/10 text-secondary border-secondary/20",
  Otros: "bg-muted text-muted-foreground border-border",
};

export const BOLIVIA_CITY_LABELS: Record<BoliviaCity, string> = {
  [BoliviaCity.LaPaz]: "La Paz",
  [BoliviaCity.SantaCruz]: "Santa Cruz",
  [BoliviaCity.Cochabamba]: "Cochabamba",
  [BoliviaCity.Sucre]: "Sucre",
  [BoliviaCity.Oruro]: "Oruro",
  [BoliviaCity.Potosi]: "Potosí",
  [BoliviaCity.Tarija]: "Tarija",
  [BoliviaCity.Beni]: "Beni",
  [BoliviaCity.Pando]: "Pando",
  [BoliviaCity.ElAlto]: "El Alto",
};

export const BOLIVIA_CITIES_ORDER: BoliviaCity[] = [
  BoliviaCity.LaPaz,
  BoliviaCity.ElAlto,
  BoliviaCity.SantaCruz,
  BoliviaCity.Cochabamba,
  BoliviaCity.Sucre,
  BoliviaCity.Oruro,
  BoliviaCity.Potosi,
  BoliviaCity.Tarija,
  BoliviaCity.Beni,
  BoliviaCity.Pando,
];
