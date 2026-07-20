import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types/users";
import UsersLib "../lib/users";

mixin (
  userProfiles : Map.Map<Principal, Types.UserProfileInternal>,
) {

  /// Register the caller with a role (Trabajador or Cliente).
  /// Traps if caller is anonymous or already registered.
  public shared ({ caller }) func registerUser(req : Types.RegisterRequest) : async Types.UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Debes iniciar sesión para registrarte");
    };
    UsersLib.register(userProfiles, caller, req, Time.now());
  };

  /// Get the caller's own profile. Returns null if not registered.
  public query ({ caller }) func getCallerUserProfile() : async ?Types.UserProfile {
    UsersLib.getProfile(userProfiles, caller);
  };

  /// Update the caller's own profile (name, phone, city). Email and role are read-only.
  public shared ({ caller }) func updateCallerUserProfile(req : Types.UpdateProfileRequest) : async Types.UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Debes iniciar sesión para actualizar tu perfil");
    };
    UsersLib.updateProfile(userProfiles, caller, req);
  };

  /// Get any user's public profile by principal.
  public query func getUserProfile(user : Principal) : async ?Types.UserProfile {
    UsersLib.getProfile(userProfiles, user);
  };
};
