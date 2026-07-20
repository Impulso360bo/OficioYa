import { createActor } from "@/backend";
import { BoliviaCity } from "@/types";
import type {
  RegisterRequest,
  UpdateProfileRequest,
  UserProfile,
} from "@/types";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCurrentUser() {
  const { actor, isFetching } = useActor(createActor);
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isRegistered: query.data != null,
    refetch: query.refetch,
  };
}

export function useRegisterUser() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, RegisterRequest>({
    mutationFn: async (req: RegisterRequest) => {
      if (!actor) throw new Error("Actor no disponible");
      return actor.registerUser(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, UpdateProfileRequest>({
    mutationFn: async (req: UpdateProfileRequest) => {
      if (!actor) throw new Error("Actor no disponible");
      return actor.updateCallerUserProfile(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export { BoliviaCity };
