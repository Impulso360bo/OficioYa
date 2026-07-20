import Common "common";

module {
  public type UserId = Principal;

  public type UserRole = {
    #Trabajador;
    #Cliente;
  };

  public type ProfileStatus = {
    #Active;
    #Suspended;
  };

  public type BoliviaCity = {
    #LaPaz;
    #SantaCruz;
    #Cochabamba;
    #Sucre;
    #Oruro;
    #Potosi;
    #Tarija;
    #Beni;
    #Pando;
    #ElAlto;
  };

  /// Mutable internal profile stored in canister state
  public type UserProfileInternal = {
    id : UserId;
    var name : Text;
    email : Text;
    var phone : Text;
    var city : BoliviaCity;
    role : UserRole;
    registeredAt : Common.Timestamp;
    var balance : Float;
    var profileStatus : ProfileStatus;
  };

  /// Immutable shared profile returned to frontend
  public type UserProfile = {
    id : UserId;
    name : Text;
    email : Text;
    phone : Text;
    city : BoliviaCity;
    role : UserRole;
    registeredAt : Common.Timestamp;
    balance : Float;
    profileStatus : ProfileStatus;
  };

  public type RegisterRequest = {
    name : Text;
    email : Text;
    phone : Text;
    city : BoliviaCity;
    role : UserRole;
  };

  public type UpdateProfileRequest = {
    name : Text;
    phone : Text;
    city : BoliviaCity;
  };
};
