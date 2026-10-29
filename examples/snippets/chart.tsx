// Complete synthetic example. Remove this provider when embedding in an existing same-theme scope.
import * as React from 'react';
import * as UI from 'nvuto-hr-ui';
import 'nvuto-hr-foundations/fonts.css';
import 'nvuto-hr-foundations/styles.css';
import 'nvuto-hr-ui/styles.css';
import {Bar,BarChart,XAxis,YAxis,CartesianGrid} from 'recharts';
const options=[{value:'alpha',label:'Alpha team'},{value:'beta',label:'Beta team with a long translated-style label'}];
export function Example({theme='light'}:{theme?:'light'|'dark'}){
const[checked,setChecked]=React.useState(false),[selected,setSelected]=React.useState('alpha'),[multiple,setMultiple]=React.useState<string[]>([]),[modal,setModal]=React.useState(false),[toast,setToast]=React.useState(true),[page,setPage]=React.useState(1),[count,setCount]=React.useState(0);
return <UI.NvutoProvider theme={theme}><><UI.ChartContainer config={{records:{label:'Example records',color:'#FF4F00'}}} style={{height:180,width:'100%'}}><BarChart data={[{label:'Alpha',records:12},{label:'Beta',records:18}]}><CartesianGrid vertical={false}/><XAxis dataKey="label"/><YAxis/><UI.ChartTooltip content={<UI.ChartTooltipContent/>}/><Bar dataKey="records" fill="var(--color-records)" isAnimationActive={false}/></BarChart></UI.ChartContainer><p>Text equivalent: Alpha 12, Beta 18 example records.</p></></UI.NvutoProvider>;
}
