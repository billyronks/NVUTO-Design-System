// Complete synthetic example. Remove this provider when embedding in an existing same-theme scope.
import * as React from 'react';
import * as UI from 'nvuto-hr-ui';
import 'nvuto-hr-foundations/fonts.css';
import 'nvuto-hr-foundations/styles.css';
import 'nvuto-hr-ui/styles.css';
import {useForm,FormProvider} from 'react-hook-form';
const options=[{value:'alpha',label:'Alpha team'},{value:'beta',label:'Beta team with a long translated-style label'}];
function FormDemo(){const form=useForm({defaultValues:{displayName:''}});return <FormProvider {...form}><UI.Form onSubmit={form.handleSubmit(()=>undefined)}><UI.FormField control={form.control} name="displayName" render={({field})=><UI.FormItem><UI.FormLabel>Display name</UI.FormLabel><UI.FormControl><UI.Input {...field}/></UI.FormControl><UI.FormDescription>Synthetic form, no service.</UI.FormDescription><UI.FormMessage/></UI.FormItem>}/></UI.Form></FormProvider>;}
export function Example({theme='light'}:{theme?:'light'|'dark'}){
const[checked,setChecked]=React.useState(false),[selected,setSelected]=React.useState('alpha'),[multiple,setMultiple]=React.useState<string[]>([]),[modal,setModal]=React.useState(false),[toast,setToast]=React.useState(true),[page,setPage]=React.useState(1),[count,setCount]=React.useState(0);
return <UI.NvutoProvider theme={theme}><FormDemo/></UI.NvutoProvider>;
}
