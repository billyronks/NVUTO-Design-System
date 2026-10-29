import * as React from 'react';import {createRoot} from 'react-dom/client';
import {NvutoProvider} from 'nvuto-hr-ui';
import 'nvuto-hr-foundations/fonts.css';import 'nvuto-hr-foundations/styles.css';import 'nvuto-hr-ui/styles.css';
import Example from './App';
import NavigationExample from './NavigationExample';
function Root(){const[theme,setTheme]=React.useState<'light'|'dark'>('light'),[navigation,setNavigation]=React.useState(false);return <NvutoProvider theme={theme}><button type="button" onClick={()=>setTheme(theme==='light'?'dark':'light')}>Switch theme</button><button type="button" onClick={()=>setNavigation(!navigation)}>Show {navigation?'form':'navigation'} example</button>{navigation?<NavigationExample/>:<Example/>}</NvutoProvider>;}createRoot(document.getElementById('root')!).render(<Root/>);
