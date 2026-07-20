import { createActor } from "@/backend";
import type { JobId } from "@/types";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useWorkerBalance() {
  const { actor, isFetching } = useActor(createActor);
  const { identity } = useInternetIdentity();

  const query = useQuery<number>({
    queryKey: ["workerBalance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getWorkerBalance();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30_000,
  });

  return {
    balance: query.data ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useTopUpBalance() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error("Actor no disponible");
      const result = await actor.topUpBalance(amount);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workerBalance"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

/** Returns the balance health state for styling */
export type BalanceState = "positive" | "warning" | "suspended";

export function getBalanceState(balance: number): BalanceState {
  if (balance <= -100) return "suspended";
  if (balance <= -50) return "warning";
  return "positive";
}

export function formatBalance(amount: number): string {
  return `${amount >= 0 ? "" : "-"}${Math.abs(amount).toFixed(2)} Bs.`;
}

/* ─── Job lifecycle mutations ─────────────────────────── */

export function useApplyForJob() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<void, Error, JobId>({
    mutationFn: async (jobId: JobId) => {
      if (!actor) throw new Error("Actor no disponible");
      const result = await actor.applyForJob(jobId);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useMarkJobComplete() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<void, Error, JobId>({
    mutationFn: async (jobId: JobId) => {
      if (!actor) throw new Error("Actor no disponible");
      const result = await actor.markJobComplete(jobId);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["workerBalance"] });
    },
  });
}

export function useApproveJob() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<void, Error, JobId>({
    mutationFn: async (jobId: JobId) => {
      if (!actor) throw new Error("Actor no disponible");
      const result = await actor.approveJob(jobId);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
