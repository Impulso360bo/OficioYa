import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/jobs";
import UsersTypes "../types/users";
import Common "../types/common";

module {
  public type JobList = List.List<Types.Job>;
  public type UserProfileMap = Map.Map<Principal, UsersTypes.UserProfileInternal>;

  /// Returns true if the job's assigned worker (if any) is Active, or if no worker is assigned
  public func isVisibleToClients(job : Types.Job, userProfiles : UserProfileMap) : Bool {
    switch (job.assignedWorker) {
      case null { true }; // no worker assigned — visible
      case (?workerId) {
        switch (userProfiles.get(workerId)) {
          case null { true }; // unknown worker — show anyway
          case (?profile) {
            switch (profile.profileStatus) {
              case (#Active) { true };
              case (#Suspended) { false };
            };
          };
        };
      };
    };
  };

  /// Convert Category variant to display text
  public func categoryToText(cat : Types.Category) : Text {
    switch (cat) {
      case (#Albanil) "Albañil";
      case (#Carpintero) "Carpintero";
      case (#Pintor) "Pintor";
      case (#Electricista) "Electricista";
      case (#Plomero) "Plomero";
      case (#Soldador) "Soldador";
      case (#Jardinero) "Jardinero";
      case (#Mecanico) "Mecánico";
      case (#Otros) "Otros";
    };
  };

  /// Convert internal mutable Job to shared JobView
  public func toView(job : Types.Job) : Types.JobView {
    {
      id = job.id;
      title = job.title;
      category = job.category;
      location = job.location;
      salaryMin = job.salaryMin;
      salaryMax = job.salaryMax;
      description = job.description;
      requirements = job.requirements;
      contactInfo = job.contactInfo;
      postedDate = job.postedDate;
      isRemote = job.isRemote;
      jobStatus = job.jobStatus;
      assignedWorker = job.assignedWorker;
      postedBy = job.postedBy;
    };
  };

  /// Paginate an array of jobs
  public func paginate(items : [Types.Job], page : Common.PageRequest) : Common.PageResult<Types.Job> {
    let total = items.size();
    let start = if (page.offset >= total) { total } else { page.offset };
    let end_ = if (start + page.limit > total) { total } else { start + page.limit };
    let sliced = items.sliceToArray(start, end_);
    { items = sliced; total; offset = page.offset; limit = page.limit };
  };

  /// Paginate an array of job views
  public func paginateViews(items : [Types.JobView], page : Common.PageRequest) : Common.PageResult<Types.JobView> {
    let total = items.size();
    let start = if (page.offset >= total) { total } else { page.offset };
    let end_ = if (start + page.limit > total) { total } else { start + page.limit };
    let sliced = items.sliceToArray(start, end_);
    { items = sliced; total; offset = page.offset; limit = page.limit };
  };

  /// Add a new job; returns (created Job, new nextId)
  public func addJob(jobs : JobList, nextId : Nat, req : Types.AddJobRequest, now : Common.Timestamp) : (Types.Job, Nat) {
    let job : Types.Job = {
      id = nextId;
      title = req.title;
      category = req.category;
      location = req.location;
      salaryMin = req.salaryMin;
      salaryMax = req.salaryMax;
      description = req.description;
      requirements = req.requirements;
      contactInfo = req.contactInfo;
      postedDate = now;
      isRemote = req.isRemote;
      var jobStatus = #Posted;
      var assignedWorker = null;
      postedBy = null;
    };
    jobs.add(job);
    (job, nextId + 1);
  };

  /// Get a job by id
  public func getJob(jobs : JobList, id : Types.JobId) : ?Types.Job {
    jobs.find(func(j) { j.id == id });
  };

  /// List all jobs as views with pagination (hides jobs with suspended workers)
  public func listJobViews(jobs : JobList, userProfiles : UserProfileMap, page : Common.PageRequest) : Common.PageResult<Types.JobView> {
    let all = jobs.toArray().filter(func(j : Types.Job) : Bool {
      isVisibleToClients(j, userProfiles)
    }).map(toView);
    paginateViews(all, page);
  };

  /// Search jobs by keyword as views (hides jobs with suspended workers)
  public func searchJobViews(jobs : JobList, userProfiles : UserProfileMap, keyword : Text, page : Common.PageRequest) : Common.PageResult<Types.JobView> {
    let lower = keyword.toLower();
    let filtered = jobs.toArray().filter(func(j : Types.Job) : Bool {
      isVisibleToClients(j, userProfiles) and (
        j.title.toLower().contains(#text lower) or
        categoryToText(j.category).toLower().contains(#text lower) or
        j.location.toLower().contains(#text lower)
      )
    }).map(toView);
    paginateViews(filtered, page);
  };

  /// Filter jobs by category as views (hides jobs with suspended workers)
  public func filterByCategoryView(jobs : JobList, userProfiles : UserProfileMap, cat : Types.Category, page : Common.PageRequest) : Common.PageResult<Types.JobView> {
    let filtered = jobs.toArray().filter(func(j : Types.Job) : Bool {
      isVisibleToClients(j, userProfiles) and j.category == cat
    }).map(toView);
    paginateViews(filtered, page);
  };

  /// Filter jobs by location as views (hides jobs with suspended workers)
  public func filterByLocationView(jobs : JobList, userProfiles : UserProfileMap, location : Text, page : Common.PageRequest) : Common.PageResult<Types.JobView> {
    let lower = location.toLower();
    let filtered = jobs.toArray().filter(func(j : Types.Job) : Bool {
      isVisibleToClients(j, userProfiles) and j.location.toLower().contains(#text lower)
    }).map(toView);
    paginateViews(filtered, page);
  };

  /// Get a single job as view
  public func getJobView(jobs : JobList, id : Types.JobId) : ?Types.JobView {
    switch (jobs.find(func(j : Types.Job) : Bool { j.id == id })) {
      case (?j) ?toView(j);
      case null null;
    };
  };

  /// List all jobs with pagination
  public func listJobs(jobs : JobList, page : Common.PageRequest) : Common.PageResult<Types.Job> {
    paginate(jobs.toArray(), page);
  };

  /// Search jobs by keyword matching title or category text
  public func searchJobs(jobs : JobList, keyword : Text, page : Common.PageRequest) : Common.PageResult<Types.Job> {
    let lower = keyword.toLower();
    let filtered = jobs.toArray().filter(func(j : Types.Job) : Bool {
      j.title.toLower().contains(#text lower) or
      categoryToText(j.category).toLower().contains(#text lower) or
      j.location.toLower().contains(#text lower)
    });
    paginate(filtered, page);
  };

  /// Filter jobs by category with pagination
  public func filterByCategory(jobs : JobList, cat : Types.Category, page : Common.PageRequest) : Common.PageResult<Types.Job> {
    let filtered = jobs.toArray().filter(func(j : Types.Job) : Bool {
      j.category == cat
    });
    paginate(filtered, page);
  };

  /// Filter jobs by location (case-insensitive substring match) with pagination
  public func filterByLocation(jobs : JobList, location : Text, page : Common.PageRequest) : Common.PageResult<Types.Job> {
    let lower = location.toLower();
    let filtered = jobs.toArray().filter(func(j : Types.Job) : Bool {
      j.location.toLower().contains(#text lower)
    });
    paginate(filtered, page);
  };

  /// Initialize sample jobs for first deploy; returns new nextId
  public func seedSampleJobs(jobs : JobList, nextId : Nat) : Nat {
    let now = Time.now();
    let samples : [Types.AddJobRequest] = [
      {
        title = "Albañil para construcción de casa habitación";
        category = #Albanil;
        location = "La Paz, Bolivia";
        salaryMin = 2500;
        salaryMax = 4000;
        description = "Se solicita albañil con experiencia en construcción de casas, manejo de ladrillo, block y hormigón. Trabajo en obra nueva en zona Sur de La Paz.";
        requirements = "Mínimo 3 años de experiencia en construcción. Conocimiento de mezclas de hormigón, colocación de ladrillo y block. Referencias laborales.";
        contactInfo = "Tel: 591 2 123-4567 | Preguntar por Ing. Mamani";
        isRemote = false;
      },
      {
        title = "Carpintero especialista en muebles a medida";
        category = #Carpintero;
        location = "Santa Cruz, Bolivia";
        salaryMin = 3000;
        salaryMax = 5000;
        description = "Taller de carpintería busca carpintero con experiencia en fabricación de muebles de cocina, closets y libreros a medida. Ambiente de trabajo profesional.";
        requirements = "Experiencia mínima de 5 años en carpintería fina. Dominio de herramientas eléctricas y manuales. Lectura de planos técnicos.";
        contactInfo = "contacto@tallermadera.bo | WhatsApp: 591 7 654-3210";
        isRemote = false;
      },
      {
        title = "Pintor de interiores y exteriores";
        category = #Pintor;
        location = "Cochabamba, Bolivia";
        salaryMin = 2500;
        salaryMax = 4000;
        description = "Se necesita pintor con experiencia en pintura de interiores y fachadas. Manejo de pintura vinílica, esmalte y texturizados. Trabajo inmediato disponible.";
        requirements = "Experiencia mínima 2 años. Conocimiento en preparación de superficies, masillado y aplicación de texturas. Puntualidad y responsabilidad.";
        contactInfo = "Tel: 591 4 555-1234 | Sra. Quiroga";
        isRemote = false;
      },
      {
        title = "Electricista para instalaciones residenciales";
        category = #Electricista;
        location = "La Paz, Bolivia";
        salaryMin = 3000;
        salaryMax = 5500;
        description = "Empresa constructora solicita electricista para instalaciones eléctricas en desarrollos residenciales en La Paz. Proyecto de 6 meses con posibilidad de extensión.";
        requirements = "Certificación en electricidad residencial. Experiencia en instalaciones domiciliarias. Conocimiento de normas eléctricas bolivianas. Disponibilidad inmediata.";
        contactInfo = "recursos@constructorabolivia.com | Tel: 591 2 333-4444";
        isRemote = false;
      },
      {
        title = "Plomero para mantenimiento de edificio";
        category = #Plomero;
        location = "El Alto, Bolivia";
        salaryMin = 2800;
        salaryMax = 4500;
        description = "Edificio de departamentos busca plomero para mantenimiento preventivo y correctivo de instalaciones hidráulicas y sanitarias. Posición permanente.";
        requirements = "3 años mínimo en plomería comercial o residencial. Experiencia en detección de fugas, destape de drenajes y reparación de tuberías. Disponibilidad para urgencias.";
        contactInfo = "mantenimiento@edificioelalto.bo | Tel: 591 2 788-9900";
        isRemote = false;
      },
      {
        title = "Soldador para taller metalmecánico";
        category = #Soldador;
        location = "Santa Cruz, Bolivia";
        salaryMin = 3500;
        salaryMax = 6000;
        description = "Taller metalmecánico solicita soldador con experiencia en soldadura eléctrica y autógena para fabricación de estructuras metálicas y rejas.";
        requirements = "Mínimo 4 años de experiencia en soldadura. Lectura de planos básicos. Conocimiento en acero y fierro. Responsable y puntual.";
        contactInfo = "empleo@tallermetal.bo | Tel: 591 3 222-3333";
        isRemote = false;
      },
      {
        title = "Jardinero para mantenimiento de áreas verdes";
        category = #Jardinero;
        location = "Cochabamba, Bolivia";
        salaryMin = 1500;
        salaryMax = 2500;
        description = "Urbanización residencial busca jardinero para mantenimiento semanal de áreas comunes, jardines privados y zonas de ornato. Trabajo permanente.";
        requirements = "Experiencia en poda, corte de césped, riego y aplicación de fertilizantes. Conocimiento básico de plantas ornamentales. Honestidad y puntualidad.";
        contactInfo = "administracion@urbanizacion.bo | Tel: 591 4 111-2222";
        isRemote = false;
      },
      {
        title = "Mecánico automotriz para taller multimarca";
        category = #Mecanico;
        location = "La Paz, Bolivia";
        salaryMin = 4000;
        salaryMax = 7000;
        description = "Taller automotriz multimarca solicita mecánico con experiencia en diagnóstico y reparación de motores a gasolina y diésel. Comisiones adicionales por productividad.";
        requirements = "5 años mínimo en mecánica automotriz. Manejo de escáner automotriz OBD2. Experiencia en frenos, suspensión y transmisión. Proactivo y ordenado.";
        contactInfo = "taller@mecanicalpaz.bo | WhatsApp: 591 7 777-8888";
        isRemote = false;
      },
      {
        title = "Electricista industrial para empresa manufacturera";
        category = #Electricista;
        location = "El Alto, Bolivia";
        salaryMin = 4500;
        salaryMax = 7500;
        description = "Empresa manufacturera en El Alto busca electricista industrial para mantenimiento de maquinaria, tableros eléctricos y sistemas de automatización.";
        requirements = "Carrera técnica en electricidad industrial o afín. Experiencia en tableros eléctricos y motores trifásicos. Disponibilidad para turno extendido.";
        contactInfo = "rh@industriaelalto.bo | Tel: 591 2 900-1111";
        isRemote = false;
      },
      {
        title = "Carpintero para obra civil";
        category = #Carpintero;
        location = "La Paz, Bolivia";
        salaryMin = 2800;
        salaryMax = 4500;
        description = "Constructora solicita carpintero de obra para encofrado y acabados en proyectos de edificación residencial y comercial en La Paz.";
        requirements = "Experiencia en carpintería de obra: encofrado y moldes de hormigón. Trabajo en altura. Disponibilidad para trabajar en diferentes zonas de La Paz.";
        contactInfo = "obra@constructoralpaz.bo | Tel: 591 2 444-6666";
        isRemote = false;
      },
      {
        title = "Plomero independiente — trabajo por proyecto";
        category = #Plomero;
        location = "Santa Cruz, Bolivia";
        salaryMin = 1800;
        salaryMax = 3200;
        description = "Se busca plomero independiente para atender servicios de reparación y mantenimiento en hogares y pequeñas empresas. Trabajo flexible por llamada o proyecto.";
        requirements = "Experiencia comprobable en plomería general. Herramienta propia. Disponibilidad de lunes a sábado. Buena actitud con clientes.";
        contactInfo = "servicios@plomeriasc.bo | Tel: 591 3 666-7777";
        isRemote = false;
      },
      {
        title = "Albañil especialista en pisos y cerámicos";
        category = #Albanil;
        location = "Cochabamba, Bolivia";
        salaryMin = 2500;
        salaryMax = 4200;
        description = "Empresa de acabados solicita albañil especializado en colocación de pisos, cerámicos y mosaicos para proyectos residenciales y comerciales en Cochabamba.";
        requirements = "Mínimo 4 años en colocación de pisos y cerámicos. Conocimiento en nivelación de superficies, adhesivos y fragüe. Referencias de proyectos anteriores.";
        contactInfo = "contratacion@acabadoscbba.bo | WhatsApp: 591 4 555-4444";
        isRemote = false;
      },
    ];

    var currentId = nextId;
    for (req in samples.values()) {
      let job : Types.Job = {
        id = currentId;
        title = req.title;
        category = req.category;
        location = req.location;
        salaryMin = req.salaryMin;
        salaryMax = req.salaryMax;
        description = req.description;
        requirements = req.requirements;
        contactInfo = req.contactInfo;
        postedDate = now;
        isRemote = req.isRemote;
        var jobStatus = #Posted;
        var assignedWorker = null;
        postedBy = null;
      };
      jobs.add(job);
      currentId += 1;
    };
    currentId;
  };
};
