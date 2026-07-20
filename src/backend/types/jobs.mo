import Common "common";
import Users "users";

module {
  public type JobId = Common.JobId;

  public type Category = {
    #Albanil;
    #Carpintero;
    #Pintor;
    #Electricista;
    #Plomero;
    #Soldador;
    #Jardinero;
    #Mecanico;
    #Otros;
  };

  public type JobStatus = {
    #Posted;
    #InProgress;
    #PendingApproval;
    #Completed;
    #Cancelled;
  };

  public type Job = {
    id : JobId;
    title : Text;
    category : Category;
    location : Text;
    salaryMin : Nat;
    salaryMax : Nat;
    description : Text;
    requirements : Text;
    contactInfo : Text;
    postedDate : Common.Timestamp;
    isRemote : Bool;
    var jobStatus : JobStatus;
    var assignedWorker : ?Users.UserId;
    postedBy : ?Users.UserId;
  };

  /// Immutable view of Job safe for sharing across the API boundary
  public type JobView = {
    id : JobId;
    title : Text;
    category : Category;
    location : Text;
    salaryMin : Nat;
    salaryMax : Nat;
    description : Text;
    requirements : Text;
    contactInfo : Text;
    postedDate : Common.Timestamp;
    isRemote : Bool;
    jobStatus : JobStatus;
    assignedWorker : ?Users.UserId;
    postedBy : ?Users.UserId;
  };

  public type AddJobRequest = {
    title : Text;
    category : Category;
    location : Text;
    salaryMin : Nat;
    salaryMax : Nat;
    description : Text;
    requirements : Text;
    contactInfo : Text;
    isRemote : Bool;
  };
};
