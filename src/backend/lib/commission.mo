import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import JobsTypes "../types/jobs";
import UsersTypes "../types/users";
import Common "../types/common";

module {
  /// Commission rate per protocol MONETIZACION_TRABAJADOR_V1
  public let COMMISSION_RATE : Float = 0.20;
  /// Suspension threshold: balance <= -100 Bs triggers suspension
  public let SUSPENSION_THRESHOLD : Float = -100.0;

  /// Apply for a job: sets status to InProgress and assigns caller as worker
  public func applyForJob(
    jobs : List.List<JobsTypes.Job>,
    userProfiles : Map.Map<Principal, UsersTypes.UserProfileInternal>,
    caller : Principal,
    jobId : Common.JobId,
  ) : { #ok; #err : Text } {
    // Verify caller is a Trabajador with an active profile
    switch (userProfiles.get(caller)) {
      case null { return #err("Perfil no encontrado") };
      case (?profile) {
        switch (profile.role) {
          case (#Trabajador) {};
          case (#Cliente) { return #err("Solo los trabajadores pueden aplicar a trabajos") };
        };
        switch (profile.profileStatus) {
          case (#Suspended) { return #err("Tu perfil está suspendido. Recarga tu saldo para reactivarlo") };
          case (#Active) {};
        };
      };
    };

    // Find the job and check it is in Posted status
    switch (jobs.find(func(j : JobsTypes.Job) : Bool { j.id == jobId })) {
      case null { #err("Trabajo no encontrado") };
      case (?job) {
        switch (job.jobStatus) {
          case (#Posted) {
            job.jobStatus := #InProgress;
            job.assignedWorker := ?caller;
            #ok;
          };
          case (_) { #err("El trabajo no está disponible para aplicar") };
        };
      };
    };
  };

  /// Worker marks job as PendingApproval (awaiting client approval)
  public func markJobComplete(
    jobs : List.List<JobsTypes.Job>,
    caller : Principal,
    jobId : Common.JobId,
  ) : { #ok; #err : Text } {
    switch (jobs.find(func(j : JobsTypes.Job) : Bool { j.id == jobId })) {
      case null { #err("Trabajo no encontrado") };
      case (?job) {
        // Only the assigned worker can mark complete
        switch (job.assignedWorker) {
          case null { return #err("No hay trabajador asignado a este trabajo") };
          case (?worker) {
            if (not Principal.equal(worker, caller)) {
              return #err("Solo el trabajador asignado puede marcar el trabajo como completado");
            };
          };
        };
        switch (job.jobStatus) {
          case (#InProgress) {
            job.jobStatus := #PendingApproval;
            #ok;
          };
          case (_) { #err("El trabajo no está en progreso") };
        };
      };
    };
  };

  /// Client approves job: sets Completed, deducts commission from worker balance, auto-suspends if needed
  public func approveJob(
    jobs : List.List<JobsTypes.Job>,
    userProfiles : Map.Map<Principal, UsersTypes.UserProfileInternal>,
    caller : Principal,
    jobId : Common.JobId,
  ) : { #ok; #err : Text } {
    switch (jobs.find(func(j : JobsTypes.Job) : Bool { j.id == jobId })) {
      case null { #err("Trabajo no encontrado") };
      case (?job) {
        // Only the job poster (client) can approve
        switch (job.postedBy) {
          case null { return #err("Este trabajo no tiene un cliente asignado") };
          case (?poster) {
            if (not Principal.equal(poster, caller)) {
              return #err("Solo el cliente que publicó el trabajo puede aprobarlo");
            };
          };
        };
        switch (job.jobStatus) {
          case (#PendingApproval) {
            // Get assigned worker
            switch (job.assignedWorker) {
              case null { return #err("No hay trabajador asignado") };
              case (?workerId) {
                // Calculate commission: 20% of salary (use salaryMax as the agreed amount)
                let salaryFloat : Float = job.salaryMax.toFloat();
                let commission : Float = salaryFloat * COMMISSION_RATE;

                // Deduct commission from worker's balance
                switch (userProfiles.get(workerId)) {
                  case null { return #err("Perfil del trabajador no encontrado") };
                  case (?workerProfile) {
                    let newBalance = workerProfile.balance - commission;
                    workerProfile.balance := newBalance;

                    // Auto-suspend if balance <= -100 Bs
                    if (newBalance <= SUSPENSION_THRESHOLD) {
                      workerProfile.profileStatus := #Suspended;
                    };

                    job.jobStatus := #Completed;
                    #ok;
                  };
                };
              };
            };
          };
          case (_) { #err("El trabajo no está en espera de aprobación") };
        };
      };
    };
  };

  /// Returns the current balance of a worker profile
  public func getWorkerBalance(
    userProfiles : Map.Map<Principal, UsersTypes.UserProfileInternal>,
    caller : Principal,
  ) : Float {
    switch (userProfiles.get(caller)) {
      case null { 0.0 };
      case (?profile) { profile.balance };
    };
  };

  /// Adds amount to worker balance and reactivates profile if balance > threshold
  public func topUpBalance(
    userProfiles : Map.Map<Principal, UsersTypes.UserProfileInternal>,
    caller : Principal,
    amount : Float,
  ) : { #ok; #err : Text } {
    if (amount <= 0.0) {
      return #err("El monto debe ser mayor a 0");
    };
    switch (userProfiles.get(caller)) {
      case null { #err("Perfil no encontrado") };
      case (?profile) {
        let newBalance = profile.balance + amount;
        profile.balance := newBalance;

        // Reactivate if balance recovers above suspension threshold
        if (newBalance > SUSPENSION_THRESHOLD) {
          profile.profileStatus := #Active;
        };
        #ok;
      };
    };
  };
};
