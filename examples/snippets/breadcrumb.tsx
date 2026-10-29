// Complete synthetic example. Remove this provider when embedding in an existing same-theme scope.
import * as React from 'react';
import * as UI from 'nvuto-hr-ui';
import 'nvuto-hr-foundations/fonts.css';
import 'nvuto-hr-foundations/styles.css';
import 'nvuto-hr-ui/styles.css';
const options=[{value:'alpha',label:'Alpha team'},{value:'beta',label:'Beta team with a long translated-style label'}];
export function Example({theme='light'}:{theme?:'light'|'dark'}){
const[checked,setChecked]=React.useState(false),[selected,setSelected]=React.useState('alpha'),[multiple,setMultiple]=React.useState<string[]>([]),[modal,setModal]=React.useState(false),[toast,setToast]=React.useState(true),[page,setPage]=React.useState(1),[count,setCount]=React.useState(0);
return <UI.NvutoProvider theme={theme}><UI.Breadcrumb><UI.BreadcrumbList><UI.BreadcrumbItem><UI.BreadcrumbLink href="#catalogue">Catalogue</UI.BreadcrumbLink></UI.BreadcrumbItem><UI.BreadcrumbSeparator/><UI.BreadcrumbItem><UI.BreadcrumbPage>Examples</UI.BreadcrumbPage></UI.BreadcrumbItem></UI.BreadcrumbList></UI.Breadcrumb></UI.NvutoProvider>;
}
