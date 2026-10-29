// Complete synthetic example. Remove this provider when embedding in an existing same-theme scope.
import * as React from 'react';
import * as UI from 'nvuto-hr-ui';
import 'nvuto-hr-foundations/fonts.css';
import 'nvuto-hr-foundations/styles.css';
import 'nvuto-hr-ui/styles.css';
const options=[{value:'alpha',label:'Alpha team'},{value:'beta',label:'Beta team with a long translated-style label'}];
export function Example({theme='light'}:{theme?:'light'|'dark'}){
const[checked,setChecked]=React.useState(false),[selected,setSelected]=React.useState('alpha'),[multiple,setMultiple]=React.useState<string[]>([]),[modal,setModal]=React.useState(false),[toast,setToast]=React.useState(true),[page,setPage]=React.useState(1),[count,setCount]=React.useState(0);
return <UI.NvutoProvider theme={theme}><><UI.TableWrapper><UI.Table aria-label="Synthetic preview"><caption>Two example records</caption><UI.TableHead><UI.TableRow><UI.TableHeaderCell scope="col">Name</UI.TableHeaderCell><UI.TableHeaderCell scope="col">State</UI.TableHeaderCell></UI.TableRow></UI.TableHead><UI.TableBody><UI.TableRow><UI.TableCell>Example Alpha</UI.TableCell><UI.TableCell>Ready</UI.TableCell></UI.TableRow><UI.TableRow><UI.TableCell>Long example record title that wraps when space is constrained</UI.TableCell><UI.TableCell>—</UI.TableCell></UI.TableRow></UI.TableBody></UI.Table></UI.TableWrapper><UI.TablePagination totalItems={4} itemsPerPage={2} currentPage={page} totalPages={2} onPageChange={setPage}/></></UI.NvutoProvider>;
}
