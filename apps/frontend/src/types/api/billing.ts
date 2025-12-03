// DTOs espelhados do backend

export interface PlanInfoDto {
  code: string;
  name: string;
  features: {
    limits: {
      workspaces: number;
      usersPerWorkspace: number;
    };
    flags: Record<string, boolean>;
  };
}

export interface SubscriptionInfoDto {
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface UsageInfoDto {
  workspacesUsed: number;
  workspacesLimit: number;
  usersInWorkspace: number;
  usersLimit: number;
}

export interface BillingInfoResponseDto {
  plan: PlanInfoDto;
  subscription: SubscriptionInfoDto | null;
  usage: UsageInfoDto;
}

export interface PriceDto {
  amount: number;
  currency: string;
  interval: string;
}

export interface PlanResponseDto {
  code: string;
  name: string;
  description: string;
  price: PriceDto | null;
  features: {
    limits: {
      workspaces: number;
      usersPerWorkspace: number;
    };
    flags: Record<string, boolean>;
  };
}

export interface CreateCheckoutRequest {
  workspaceId: string;
  planCode: string;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface CreatePortalRequest {
  workspaceId: string;
}

export interface CreatePortalResponse {
  portalUrl: string;
}
