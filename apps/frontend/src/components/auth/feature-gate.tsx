import { useFeatureFlags } from '@/hooks/use-feature-flags'

interface FeatureGateProps {
  /**
   * Nome da feature a ser verificada
   */
  feature: 'workspace' | 'workspaceSwitching'
  /**
   * Conteúdo a ser renderizado se a feature estiver habilitada
   */
  children: React.ReactNode
  /**
   * Conteúdo alternativo a ser renderizado se a feature estiver desabilitada
   */
  fallback?: React.ReactNode
}

/**
 * Componente que controla renderização condicional baseada em feature flags
 *
 * @example
 * ```tsx
 * <FeatureGate feature="workspace">
 *   <WorkspaceSwitcher />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const featureFlags = useFeatureFlags()

  const isEnabled = (() => {
    switch (feature) {
      case 'workspace':
        return featureFlags.workspaceEnabled
      case 'workspaceSwitching':
        return featureFlags.workspaceSwitchingEnabled
      default:
        return false
    }
  })()

  if (!isEnabled) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
