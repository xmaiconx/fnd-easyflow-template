export interface PlanLimits {
  workspaces: number;
  usersPerWorkspace: number;
}

export interface PlanFlags {
  [key: string]: boolean;
}

export interface PlanFeatures {
  limits: PlanLimits;
  flags: PlanFlags;
}
