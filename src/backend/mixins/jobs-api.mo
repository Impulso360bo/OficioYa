import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/jobs";
import UsersTypes "../types/users";
import Common "../types/common";
import JobsLib "../lib/jobs";

mixin (
  jobs : List.List<Types.Job>,
  state : { var nextJobId : Nat; var seeded : Bool },
  userProfiles : Map.Map<Principal, UsersTypes.UserProfileInternal>,
) {

  /// Seed sample jobs once on first deploy
  private func ensureSeeded() {
    if (not state.seeded) {
      state.nextJobId := JobsLib.seedSampleJobs(jobs, state.nextJobId);
      state.seeded := true;
    };
  };

  /// List all jobs with pagination (hidden if assigned worker is suspended)
  public query func listJobs(offset : Nat, limit : Nat) : async Common.PageResult<Types.JobView> {
    JobsLib.listJobViews(jobs, userProfiles, { offset; limit });
  };

  /// Search jobs by keyword (matches title, category, or location); hidden if assigned worker is suspended
  public query func searchJobs(keyword : Text, offset : Nat, limit : Nat) : async Common.PageResult<Types.JobView> {
    JobsLib.searchJobViews(jobs, userProfiles, keyword, { offset; limit });
  };

  /// Filter jobs by category; hidden if assigned worker is suspended
  public query func filterJobsByCategory(category : Types.Category, offset : Nat, limit : Nat) : async Common.PageResult<Types.JobView> {
    JobsLib.filterByCategoryView(jobs, userProfiles, category, { offset; limit });
  };

  /// Filter jobs by location; hidden if assigned worker is suspended
  public query func filterJobsByLocation(location : Text, offset : Nat, limit : Nat) : async Common.PageResult<Types.JobView> {
    JobsLib.filterByLocationView(jobs, userProfiles, location, { offset; limit });
  };

  /// Get a single job by id
  public query func getJob(id : Types.JobId) : async ?Types.JobView {
    JobsLib.getJobView(jobs, id);
  };

  /// Add a new job
  public shared func addJob(req : Types.AddJobRequest) : async Types.JobView {
    ensureSeeded();
    let now = Time.now();
    let (job, newId) = JobsLib.addJob(jobs, state.nextJobId, req, now);
    state.nextJobId := newId;
    JobsLib.toView(job);
  };

  /// Trigger seeding manually (idempotent — only seeds once)
  public shared func initSampleData() : async () {
    ensureSeeded();
  };
};
