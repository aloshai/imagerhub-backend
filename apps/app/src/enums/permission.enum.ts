export enum Permission {
  None,
  User = 1 << 1,
  Moderator = 1 << 2,
  Admin = 1 << 3,
}
