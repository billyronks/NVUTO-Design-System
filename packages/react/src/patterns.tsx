import * as React from 'react';
import { cn } from './utils';
import { Button } from './button';

/** Geometry from HR shell/list/settings compositions. Slot APIs are PROPOSED.
 * Caller owns routing, roles, data fetching and workflow permission decisions.
 */
export function AppShell({navigation, header, children, className}: {navigation: React.ReactNode; header: React.ReactNode; children: React.ReactNode; className?: string}) {
  return <div className={cn('nvuto-app-shell', className)}><aside className="nvuto-shell-navigation" aria-label="Workspace navigation">{navigation}</aside><div className="nvuto-shell-body"><header className="nvuto-shell-header">{header}</header><main className="nvuto-shell-main">{children}</main></div></div>;
}
export function ListPage({title, description, actions, filters, children}: {title: string; description?: string; actions?: React.ReactNode; filters?: React.ReactNode; children: React.ReactNode}) {
  return <section className="nvuto-list-page"><div className="nvuto-page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div><div>{actions}</div></div>{filters && <div className="nvuto-filter-bar">{filters}</div>}<div className="nvuto-list-content">{children}</div></section>;
}
export function SettingsSection({title, description, children, actions}: {title: string; description?: string; children: React.ReactNode; actions?: React.ReactNode}) {
  return <section className="nvuto-settings-section"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><div className="nvuto-settings-fields">{children}{actions && <div className="nvuto-settings-actions">{actions}</div>}</div></section>;
}
export function StatePanel({kind, title, children, onRetry}: {kind: 'loading' | 'empty' | 'error' | 'success' | 'forbidden' | 'offline' | 'degraded'; title: string; children?: React.ReactNode; onRetry?: () => void}) {
  return <div className="nvuto-state-panel" data-kind={kind} role={kind === 'error' ? 'alert' : kind === 'loading' || kind === 'success' ? 'status' : undefined} aria-busy={kind === 'loading' || undefined}><h2>{title}</h2><div>{children}</div>{onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}</div>;
}
export function StepFlow({steps, current, children}: {steps: string[]; current: number; children: React.ReactNode}) {
  return <section className="nvuto-step-flow"><ol aria-label="Progress">{steps.map((step, i) => <li key={i} aria-current={i === current ? 'step' : undefined}><span aria-hidden="true">{i + 1}</span>{step}</li>)}</ol>{children}</section>;
}
