module {
  public type JobId = Nat;
  public type Timestamp = Int;

  public type PageRequest = {
    offset : Nat;
    limit : Nat;
  };

  public type PageResult<T> = {
    items : [T];
    total : Nat;
    offset : Nat;
    limit : Nat;
  };
};
