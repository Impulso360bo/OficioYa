import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import CommissionLib "../lib/commission";
import JobsTypes "../types/jobs";
import UsersTypes "../types/users";
import Common "../types/common";

mixin (
  jobs : List.List<JobsTypes.Job>,
  userProfiles : Map.Map<Principal, UsersTypes.UserProfileInternal>,
) {
  /// Worker applies for a job; transitions job to InProgress and sets assignedWorker
  public shared ({ caller }) func applyForJob(jobId : Common.JobId) : async { #ok; #err : Text } {
    CommissionLib.applyForJob(jobs, userProfiles, caller, jobId);
  };

  /// Assigned worker marks job as PendingApproval; client must approve to trigger commission
  public shared ({ caller }) func markJobComplete(jobId : Common.JobId) : async { #ok; #err : Text } {
    CommissionLib.markJobComplete(jobs, caller, jobId);
  };

  /// Client approves completed job; deducts 20% commission from worker balance, auto-suspends if balance <= -100 Bs
  public shared ({ caller }) func approveJob(jobId : Common.JobId) : async { #ok; #err : Text } {
    CommissionLib.approveJob(jobs, userProfiles, caller, jobId);
  };

  /// Returns caller's current balance in Bs (Trabajador only)
  public shared query ({ caller }) func getWorkerBalance() : async Float {
    CommissionLib.getWorkerBalance(userProfiles, caller);
  };

  /// Adds amount to caller's worker balance; reactivates profile if balance recovers above -100 Bs
  public shared ({ caller }) func topUpBalance(amount : Float) : async { #ok; #err : Text } {
    CommissionLib.topUpBalance(userProfiles, caller, amount);
  };
};
