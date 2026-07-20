import type { Job, PageResult, SearchParams } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Category, createActor } from "../backend";

const PAGE_SIZE = BigInt(20);

// Map frontend Category type string → backend Category enum
function toBackendCategory(cat: string): Category {
  const map: Record<string, Category> = {
    Albanil: Category.Albanil,
    Carpintero: Category.Carpintero,
    Pintor: Category.Pintor,
    Electricista: Category.Electricista,
    Plomero: Category.Plomero,
    Soldador: Category.Soldador,
    Jardinero: Category.Jardinero,
    Mecanico: Category.Mecanico,
    Otros: Category.Otros,
  };
  return map[cat] ?? Category.Otros;
}

// Seed on first load — called once per session
let seeded = false;

export function useInitSampleData() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<void>({
    queryKey: ["initSampleData"],
    queryFn: async () => {
      if (!actor || seeded) return;
      await actor.initSampleData();
      seeded = true;
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}

export function useJobs(params?: Partial<SearchParams>) {
  const { actor, isFetching } = useActor(createActor);
  const query = params?.query?.trim() ?? "";
  const category = params?.category ?? "Todas";
  const location = params?.location?.trim() ?? "";

  return useInfiniteQuery<PageResult<Job>>({
    queryKey: ["jobs", params],
    initialPageParam: BigInt(0),
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as bigint;

      if (!actor) {
        return { items: [], total: BigInt(0), offset, limit: PAGE_SIZE };
      }

      let result: PageResult<Job>;

      if (query) {
        result = await actor.searchJobs(query, offset, PAGE_SIZE);
      } else if (category !== "Todas") {
        result = await actor.filterJobsByCategory(
          toBackendCategory(category),
          offset,
          PAGE_SIZE,
        );
      } else if (location) {
        result = await actor.filterJobsByLocation(location, offset, PAGE_SIZE);
      } else {
        result = await actor.listJobs(offset, PAGE_SIZE);
      }

      // Client-side filter for isRemote when combined with other filters
      if (params?.isRemote !== null && params?.isRemote !== undefined) {
        const filtered = result.items.filter(
          (j) => j.isRemote === params.isRemote,
        );
        return {
          ...result,
          items: filtered,
          total: BigInt(filtered.length),
        };
      }

      return result;
    },
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      if (nextOffset >= lastPage.total) return undefined;
      return nextOffset;
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useJob(id: string | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Job | null>({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id || !actor) return null;
      return actor.getJob(BigInt(id));
    },
    enabled: !!id && !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useCategoryCount() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Record<string, number>>({
    queryKey: ["categoryCount"],
    queryFn: async () => {
      if (!actor) return {};
      const result = await actor.listJobs(BigInt(0), BigInt(200));
      const counts: Record<string, number> = {};
      for (const j of result.items) {
        counts[j.category] = (counts[j.category] ?? 0) + 1;
      }
      return counts;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}
