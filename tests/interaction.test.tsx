import * as React from 'react';
import {render,screen,fireEvent} from '@testing-library/react';
import {describe,it,expect,vi} from 'vitest';
import {Button} from '../packages/react/src/button';
import {ToggleSwitch} from '../packages/react/src/ToggleSwitch';
import {Input} from '../packages/react/src/input';
import {NativeSelect} from '../packages/react/src/NativeSelect';
import {NvutoProvider} from '../packages/react/src/NvutoProvider';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription} from '../packages/react/src/dialog';
describe('extraction regressions and source defects',()=>{
 it('prevents disabled slotted link and child handlers from activating',()=>{const clicked=vi.fn();render(<Button asChild disabled><a href="#forbidden" onClick={clicked}>Disabled destination</a></Button>);const a=screen.getByRole('link');fireEvent.click(a);expect(clicked).not.toHaveBeenCalled();expect(a).toHaveAttribute('tabindex','-1');});
 it('associates switch label and toggles once',()=>{const changed=vi.fn();render(<ToggleSwitch label="Send reminders" checked={false} onChange={changed}/>);expect(screen.getByRole('switch',{name:'Send reminders'})).toHaveAttribute('aria-checked','false');fireEvent.click(screen.getByText('Send reminders'));expect(changed).toHaveBeenCalledExactlyOnceWith(true);});
 it('connects invalid input to its error',()=>{render(<Input label="Team name" error="Name is required"/>);const input=screen.getByLabelText('Team name');expect(input).toHaveAttribute('aria-invalid','true');expect(input).toHaveAccessibleDescription('Name is required');});
 it('keeps native select value and caller callback',()=>{const changed=vi.fn();render(<NativeSelect aria-label="Region" onChange={changed}><option value="a">Alpha</option><option value="b">Beta</option></NativeSelect>);fireEvent.change(screen.getByRole('combobox'),{target:{value:'b'}});expect(changed).toHaveBeenCalledOnce();});
 it('keeps dark overlay inside its provider',async()=>{render(<NvutoProvider theme="dark"><Dialog><DialogTrigger>Open example</DialogTrigger><DialogContent><DialogTitle>Example dialog</DialogTitle><DialogDescription>Controlled example</DialogDescription></DialogContent></Dialog></NvutoProvider>);fireEvent.click(screen.getByText('Open example'));expect((await screen.findByRole('dialog')).closest('[data-nvuto-theme="dark"]')).not.toBeNull();});
});
