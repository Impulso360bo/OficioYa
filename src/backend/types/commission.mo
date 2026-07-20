import Common "common";
import Users "users";

module {
  public type CommissionRate = Float; // 0.20 = 20%

  public type ProfileStatus = {
    #Active;
    #Suspended;
  };

  public type JobStatus = {
    #Posted;
    #InProgress;
    #PendingApproval;
    #Completed;
    #Cancelled;
  };

  public type CommissionTransaction = {
    jobId : Common.JobId;
    workerId : Users.UserId;
    jobSalary : Float;
    commissionAmount : Float;
    timestamp : Common.Timestamp;
  };
};
