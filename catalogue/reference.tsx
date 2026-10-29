import * as React from 'react';import {createRoot} from 'react-dom/client';
import {Button} from '../audit/as-is/src/app/components/ui/button';import {Input} from '../audit/as-is/src/app/components/ui/input';import {NativeSelect} from '../audit/as-is/src/app/components/ui/NativeSelect';import * as Card from '../audit/as-is/src/app/components/ui/card';import * as Table from '../audit/as-is/src/app/components/ui/DataTable';
import 'nvuto-hr-foundations/fonts.css';import './reference.css';import {Fixture} from './fixture-layout';
const dark=new URLSearchParams(location.search).get('theme')==='dark';document.documentElement.classList.toggle('dark',dark);createRoot(document.getElementById('root')!).render(<Fixture UI={{Button,Input,NativeSelect,...Card,...Table}}/>);
