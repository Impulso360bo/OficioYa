import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/users";
import Common "../types/common";

module {

  /// Convert internal mutable profile to shared immutable profile
  public func toPublic(self : Types.UserProfileInternal) : Types.UserProfile {
    {
      id = self.id;
      name = self.name;
      email = self.email;
      phone = self.phone;
      city = self.city;
      role = self.role;
      registeredAt = self.registeredAt;
      balance = self.balance;
      profileStatus = self.profileStatus;
    };
  };

  /// Register a new user; returns the created profile or traps if already registered
  public func register(
    profiles : Map.Map<Principal, Types.UserProfileInternal>,
    caller : Principal,
    req : Types.RegisterRequest,
    now : Common.Timestamp,
  ) : Types.UserProfile {
    if (profiles.containsKey(caller)) {
      Runtime.trap("Usuario ya registrado");
    };
    let internal : Types.UserProfileInternal = {
      id = caller;
      var name = req.name;
      email = req.email;
      var phone = req.phone;
      var city = req.city;
      role = req.role;
      registeredAt = now;
      var balance = 0.0;
      var profileStatus = #Active;
    };
    profiles.add(caller, internal);
    toPublic(internal);
  };

  /// Get public profile for a given principal
  public func getProfile(
    profiles : Map.Map<Principal, Types.UserProfileInternal>,
    userId : Principal,
  ) : ?Types.UserProfile {
    switch (profiles.get(userId)) {
      case (?internal) { ?toPublic(internal) };
      case null { null };
    };
  };

  /// Update mutable profile fields (name, phone, city); traps if not found
  public func updateProfile(
    profiles : Map.Map<Principal, Types.UserProfileInternal>,
    caller : Principal,
    req : Types.UpdateProfileRequest,
  ) : Types.UserProfile {
    switch (profiles.get(caller)) {
      case (?internal) {
        internal.name := req.name;
        internal.phone := req.phone;
        internal.city := req.city;
        toPublic(internal);
      };
      case null {
        Runtime.trap("Usuario no encontrado");
      };
    };
  };
};
