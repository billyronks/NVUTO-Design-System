import * as React from 'react';
import {AppShell,ListPage,SettingsSection,StatePanel,Button,Input,NativeSelect,TableWrapper,Table,TableHead,TableHeaderCell,TableBody,TableRow,TableCell,StatusBadge,Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,DialogClose,ToggleSwitch} from 'nvuto-hr-ui';
import logo from 'nvuto-hr-foundations/assets/NVUTO-HR.svg?url';

export default function Example() {
 const [name,setName]=React.useState('Example workspace'),[saved,setSaved]=React.useState(false),[alerts,setAlerts]=React.useState(false);
 return <AppShell navigation={<nav><img src={logo} width="112" height="40" alt="NVUTO HR"/><a href="#records">Records</a><br/><a href="#settings">Settings</a></nav>} header={<span>Synthetic module · no product backend</span>}>
  <ListPage title="Workspace records" description="Public package imports, controlled state and synthetic fixtures." actions={<Dialog><DialogTrigger asChild><Button variant="outline">Review example</Button></DialogTrigger><DialogContent><DialogTitle>Review workspace</DialogTitle><DialogDescription>Example only. No production action is performed.</DialogDescription><p>{name}</p><DialogClose asChild><Button variant="outline">Close review</Button></DialogClose></DialogContent></Dialog>}>
   <div id="records"><TableWrapper><Table aria-label="Synthetic records"><caption>Example workspace records</caption><TableHead><TableRow><TableHeaderCell scope="col">Record</TableHeaderCell><TableHeaderCell scope="col">State</TableHeaderCell></TableRow></TableHead><TableBody><TableRow><TableCell>Example record with a long descriptive title for wrapping</TableCell><TableCell><StatusBadge variant="success">Ready</StatusBadge></TableCell></TableRow><TableRow><TableCell>—</TableCell><TableCell><StatusBadge variant="neutral">Unspecified</StatusBadge></TableCell></TableRow></TableBody></Table></TableWrapper></div>
  </ListPage>
  <div id="settings"><form onSubmit={e=>{e.preventDefault();setSaved(true);}}><SettingsSection title="Module settings" description="The host owns validation and persistence." actions={<Button type="submit" variant="outline">Save example</Button>}>
   <Input label="Workspace name" value={name} onChange={e=>{setName(e.target.value);setSaved(false);}} required/>
   <label>Display density<NativeSelect defaultValue="standard"><option value="standard">Standard</option><option value="compact">Compact layout chosen by module</option></NativeSelect></label>
   <ToggleSwitch label="Example reminders" checked={alerts} onChange={setAlerts}/>
  </SettingsSection></form></div>
  {saved&&<StatePanel kind="success" title="Example saved">Saved in component state for this simulation.</StatePanel>}
 </AppShell>;
}
