import type { backendInterface } from "../backend";
import { Category, JobStatus, ProfileStatus, UserRole } from "../backend";

const sampleJobs = [
  {
    id: BigInt(1),
    title: "Albañil para obra nueva en Zona Norte",
    contactInfo: "contacto@constructora.bo",
    postedDate: BigInt(Date.now() * 1_000_000),
    isRemote: false,
    jobStatus: JobStatus.Posted,
    description: "Se busca albañil con experiencia en construcción de muros y acabados. Trabajo de lunes a sábado. Pago quincenal.",
    category: Category.Albanil,
    salaryMin: BigInt(2000),
    salaryMax: BigInt(3500),
    requirements: "3 años de experiencia, referencias laborales",
    location: "La Paz",
  },
  {
    id: BigInt(2),
    title: "Electricista Certificado — Instalaciones Industriales",
    contactInfo: "rrhh@industrias.bo",
    postedDate: BigInt((Date.now() - 86400000) * 1_000_000),
    isRemote: false,
    jobStatus: JobStatus.Posted,
    description: "Electricista con conocimiento en tableros industriales, cableado estructurado y sistemas de baja y media tensión.",
    category: Category.Electricista,
    salaryMin: BigInt(3000),
    salaryMax: BigInt(5000),
    requirements: "Certificación técnica o similar, 5 años de experiencia",
    location: "La Paz",
  },
  {
    id: BigInt(3),
    title: "Carpintero para muebles de cocina",
    contactInfo: "taller.maderas@gmail.com",
    postedDate: BigInt((Date.now() - 172800000) * 1_000_000),
    isRemote: false,
    jobStatus: JobStatus.InProgress,
    description: "Taller de carpintería busca carpintero con experiencia en fabricación de muebles a medida, cocinas integrales y closets.",
    category: Category.Carpintero,
    salaryMin: BigInt(2500),
    salaryMax: BigInt(4000),
    requirements: "Manejo de maquinaria carpintera, conocimiento en materiales MDF y madera sólida",
    location: "El Alto",
  },
  {
    id: BigInt(4),
    title: "Plomero — Remodelaciones Residenciales",
    contactInfo: "obras.residencial@hotmail.com",
    postedDate: BigInt((Date.now() - 259200000) * 1_000_000),
    isRemote: false,
    jobStatus: JobStatus.Posted,
    description: "Empresa de remodelaciones solicita plomero para instalaciones hidráulicas, sanitarias y de gas en residencias.",
    category: Category.Plomero,
    salaryMin: BigInt(1800),
    salaryMax: BigInt(3000),
    requirements: "Experiencia en plomería residencial, herramienta propia",
    location: "La Paz",
  },
  {
    id: BigInt(5),
    title: "Pintor de Interiores y Exteriores",
    contactInfo: "pinturas.express@gmail.com",
    postedDate: BigInt((Date.now() - 345600000) * 1_000_000),
    isRemote: false,
    jobStatus: JobStatus.Posted,
    description: "Empresa de acabados busca pintor con experiencia en pintura vinílica, esmalte, texturizados y empastado de muros.",
    category: Category.Pintor,
    salaryMin: BigInt(1500),
    salaryMax: BigInt(2800),
    requirements: "Experiencia comprobable, trabajo en equipo",
    location: "La Paz",
  },
  {
    id: BigInt(6),
    title: "Soldador MIG/TIG — Estructura Metálica",
    contactInfo: "metalmecanica@aceros.bo",
    postedDate: BigInt((Date.now() - 432000000) * 1_000_000),
    isRemote: false,
    jobStatus: JobStatus.PendingApproval,
    description: "Taller metalmecánico solicita soldador con dominio de soldadura MIG, TIG y electrodo revestido para fabricación de estructuras.",
    category: Category.Soldador,
    salaryMin: BigInt(3000),
    salaryMax: BigInt(4500),
    requirements: "Certificación en soldadura, 4 años de experiencia mínimo",
    location: "La Paz",
  },
];

const pageResult = {
  total: BigInt(6),
  offset: BigInt(0),
  limit: BigInt(10),
  items: sampleJobs,
};

export const mockBackend: backendInterface = {
  addJob: async (req) => ({
    id: BigInt(99),
    ...req,
    postedDate: BigInt(Date.now() * 1_000_000),
    jobStatus: JobStatus.Posted,
  }),
  filterJobsByCategory: async (_category, offset, limit) => ({
    ...pageResult,
    offset,
    limit,
    items: sampleJobs.filter((j) => j.category === _category),
    total: BigInt(sampleJobs.filter((j) => j.category === _category).length),
  }),
  filterJobsByLocation: async (_location, offset, limit) => ({
    ...pageResult,
    offset,
    limit,
    items: sampleJobs.filter((j) => j.location.toLowerCase().includes(_location.toLowerCase())),
    total: BigInt(sampleJobs.filter((j) => j.location.toLowerCase().includes(_location.toLowerCase())).length),
  }),
  getJob: async (id) => sampleJobs.find((j) => j.id === id) ?? null,
  initSampleData: async () => undefined,
  listJobs: async (offset, limit) => ({ ...pageResult, offset, limit }),
  searchJobs: async (keyword, offset, limit) => ({
    ...pageResult,
    offset,
    limit,
    items: sampleJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(keyword.toLowerCase()) ||
        j.description.toLowerCase().includes(keyword.toLowerCase())
    ),
    total: BigInt(
      sampleJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(keyword.toLowerCase()) ||
          j.description.toLowerCase().includes(keyword.toLowerCase())
      ).length
    ),
  }),
  getCallerUserProfile: async () => null,
  getUserProfile: async (_user) => null,
  registerUser: async (req) => ({
    id: { __principal__: "mock-principal" } as unknown as import("../backend.d").UserId,
    name: req.name,
    email: req.email,
    phone: req.phone,
    city: req.city,
    role: req.role,
    balance: 0,
    profileStatus: ProfileStatus.Active,
    registeredAt: BigInt(Date.now() * 1_000_000),
  }),
  updateCallerUserProfile: async (req) => ({
    id: { __principal__: "mock-principal" } as unknown as import("../backend.d").UserId,
    name: req.name,
    email: "mock@example.com",
    phone: req.phone,
    city: req.city,
    role: UserRole.Trabajador,
    balance: 0,
    profileStatus: ProfileStatus.Active,
    registeredAt: BigInt(Date.now() * 1_000_000),
  }),
  applyForJob: async (_jobId) => ({ __kind__: "ok", ok: null }),
  markJobComplete: async (_jobId) => ({ __kind__: "ok", ok: null }),
  approveJob: async (_jobId) => ({ __kind__: "ok", ok: null }),
  getWorkerBalance: async () => 0,
  topUpBalance: async (_amount) => ({ __kind__: "ok", ok: null }),
};

