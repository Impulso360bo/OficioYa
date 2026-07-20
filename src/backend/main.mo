import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import JobsTypes "types/jobs";
import UsersTypes "types/users";
import JobsMixin "mixins/jobs-api";
import UsersMixin "mixins/users-api";
import CommissionMixin "mixins/commission-api";



actor {
  let jobs = List.empty<JobsTypes.Job>();
  let state = { var nextJobId : Nat = 0; var seeded : Bool = false };
  let userProfiles = Map.empty<Principal, UsersTypes.UserProfileInternal>();

  include JobsMixin(jobs, state, userProfiles);
  include UsersMixin(userProfiles);
  include CommissionMixin(jobs, userProfiles);
};
