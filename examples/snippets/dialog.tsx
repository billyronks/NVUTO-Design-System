// Complete synthetic example. Remove this provider when embedding in an existing same-theme scope.
import * as React from 'react';
import * as UI from 'nvuto-hr-ui';
import 'nvuto-hr-foundations/fonts.css';
import 'nvuto-hr-foundations/styles.css';
import 'nvuto-hr-ui/styles.css';
const options=[{value:'alpha',label:'Alpha team'},{value:'beta',label:'Beta team with a long translated-style label'}];
export function Example({theme='light'}:{theme?:'light'|'dark'}){
const[checked,setChecked]=React.useState(false),[selected,setSelected]=React.useState('alpha'),[multiple,setMultiple]=React.useState<string[]>([]),[modal,setModal]=React.useState(false),[toast,setToast]=React.useState(true),[page,setPage]=React.useState(1),[count,setCount]=React.useState(0);
return <UI.NvutoProvider theme={theme}><UI.Dialog><UI.DialogTrigger asChild><UI.Button variant="outline">Open dialog</UI.Button></UI.DialogTrigger><UI.DialogContent><UI.DialogTitle>Example dialog</UI.DialogTitle><UI.DialogDescription>Focus should remain here until dismissed.</UI.DialogDescription><UI.Input label="Dialog field"/><UI.DialogClose asChild><UI.Button variant="outline">Done</UI.Button></UI.DialogClose></UI.DialogContent></UI.Dialog></UI.NvutoProvider>;
}
