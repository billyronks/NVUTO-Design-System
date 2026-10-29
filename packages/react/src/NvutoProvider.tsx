import * as React from 'react';
import { createPortal } from 'react-dom';

export type NvutoTheme = 'light' | 'dark';
type ThemeContext = { container: HTMLDivElement | null; theme: NvutoTheme };
const Context = React.createContext<ThemeContext | null>(null);

/** PROPOSED extraction adapter. Does not read storage or change document classes.
 * Supply the server-selected theme on both server and first client render.
 * Host applications own persistence, system preference and cross-tab policy.
 */
export function NvutoProvider({theme = 'light', children, className = '', ...props}: React.HTMLAttributes<HTMLDivElement> & {theme?: NvutoTheme}) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  if (theme !== 'light' && theme !== 'dark') throw new Error('Unsupported Nvuto theme: ' + theme);
  return <Context.Provider value={React.useMemo(() => ({container, theme}), [container, theme])}>
    <div {...props} ref={setContainer} className={`nvuto-root ${theme === 'dark' ? 'dark' : ''} ${className}`} data-nvuto-theme={theme}>{children}</div>
  </Context.Provider>;
}

/** All overlays stay inside the themed scope. No document access during SSR. */
export function NvutoPortal({as: Primitive, children, ...props}: {as?: React.ElementType; children?: React.ReactNode; [key: string]: unknown}) {
  const context = React.useContext(Context);
  if (!context) throw new Error('Nvuto overlays require NvutoProvider.');
  if (!context.container) return null;
  if (Primitive) return <Primitive {...props} container={context.container}>{children}</Primitive>;
  return createPortal(children, context.container);
}

// Function returns a component rather than invoking hooks in a conditional caller.
export function createNvutoPortal(children: React.ReactNode, _legacyTarget?: Element | DocumentFragment) {
  return <NvutoPortal>{children}</NvutoPortal>;
}
