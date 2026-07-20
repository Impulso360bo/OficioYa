import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export type JobId = bigint;
export interface JobView {
    id: JobId;
    title: string;
    postedBy?: UserId;
    contactInfo: string;
    postedDate: Timestamp;
    jobStatus: JobStatus;
    assignedWorker?: UserId;
    isRemote: boolean;
    description: string;
    category: Category;
    salaryMax: bigint;
    salaryMin: bigint;
    requirements: string;
    location: string;
}
export type UserId = Principal;
export interface UpdateProfileRequest {
    city: BoliviaCity;
    name: string;
    phone: string;
}
export interface AddJobRequest {
    title: string;
    contactInfo: string;
    isRemote: boolean;
    description: string;
    category: Category;
    salaryMax: bigint;
    salaryMin: bigint;
    requirements: string;
    location: string;
}
export interface RegisterRequest {
    city: BoliviaCity;
    name: string;
    role: UserRole;
    email: string;
    phone: string;
}
export interface PageResult {
    total: bigint;
    offset: bigint;
    limit: bigint;
    items: Array<JobView>;
}
export interface UserProfile {
    id: UserId;
    balance: number;
    city: BoliviaCity;
    name: string;
    role: UserRole;
    email: string;
    profileStatus: ProfileStatus;
    phone: string;
    registeredAt: Timestamp;
}
export enum BoliviaCity {
    LaPaz = "LaPaz",
    Sucre = "Sucre",
    Beni = "Beni",
    Potosi = "Potosi",
    Cochabamba = "Cochabamba",
    Pando = "Pando",
    SantaCruz = "SantaCruz",
    Tarija = "Tarija",
    Oruro = "Oruro",
    ElAlto = "ElAlto"
}
export enum Category {
    Electricista = "Electricista",
    Mecanico = "Mecanico",
    Plomero = "Plomero",
    Albanil = "Albanil",
    Carpintero = "Carpintero",
    Soldador = "Soldador",
    Pintor = "Pintor",
    Otros = "Otros",
    Jardinero = "Jardinero"
}
export enum JobStatus {
    Posted = "Posted",
    Cancelled = "Cancelled",
    PendingApproval = "PendingApproval",
    InProgress = "InProgress",
    Completed = "Completed"
}
export enum ProfileStatus {
    Active = "Active",
    Suspended = "Suspended"
}
export enum UserRole {
    Trabajador = "Trabajador",
    Cliente = "Cliente"
}
export interface backendInterface {
    addJob(req: AddJobRequest): Promise<JobView>;
    applyForJob(jobId: JobId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    approveJob(jobId: JobId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    filterJobsByCategory(category: Category, offset: bigint, limit: bigint): Promise<PageResult>;
    filterJobsByLocation(location: string, offset: bigint, limit: bigint): Promise<PageResult>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getJob(id: JobId): Promise<JobView | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkerBalance(): Promise<number>;
    initSampleData(): Promise<void>;
    listJobs(offset: bigint, limit: bigint): Promise<PageResult>;
    markJobComplete(jobId: JobId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerUser(req: RegisterRequest): Promise<UserProfile>;
    searchJobs(keyword: string, offset: bigint, limit: bigint): Promise<PageResult>;
    topUpBalance(amount: number): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateCallerUserProfile(req: UpdateProfileRequest): Promise<UserProfile>;
}
