/**
 * Hook para acessar feature flags
 *
 * Feature flags são configuradas via environment variables (.env)
 * e controlam funcionalidades que podem ser habilitadas/desabilitadas
 */
export interface FeatureFlags {
  workspaceEnabled: boolean;
  workspaceSwitchingEnabled: boolean;
}

export function useFeatureFlags(): FeatureFlags {
  const parseBoolean = (value: string | undefined, defaultValue: boolean = true): boolean => {
    if (value === undefined || value === '') return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  };

  return {
    workspaceEnabled: parseBoolean(import.meta.env.VITE_FEATURES_WORKSPACE_ENABLED, true),
    workspaceSwitchingEnabled: parseBoolean(
      import.meta.env.VITE_FEATURES_WORKSPACE_SWITCHING_ENABLED,
      true
    ),
  };
}
