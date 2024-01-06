'use client'

import { Key, ReactNode } from 'react';
import { Select, Selection, SelectItem, SelectedItems, getKeyValue } from '@nextui-org/react';


export interface NamedSelectItem {
    id: number;
    name: string;
}

export type OnSelectionChange = (keys: Selection) => any;

export interface CustomSelectProps<T> {
    items: T[];
    keyField?: string;
    textValueField?: string;
    placeholder: string;
    isRequired?: boolean;
    selectionMode?: 'single' | 'multiple';
    selectedKeys: 'all' | Iterable<Key>;
    onSelectionChange: OnSelectionChange;
    customRender?: (items: SelectedItems<T>) => ReactNode;
    expandedCustomRender?: (item: T) => JSX.Element;
}

export function CustomSelect<T>(props: CustomSelectProps<T>) {
    
    const { items, keyField, textValueField, isRequired, selectionMode, placeholder, selectedKeys, onSelectionChange, customRender, expandedCustomRender } = props;

    const isInvalid = isRequired && (selectedKeys as Set<Key>).size === 0;

    return (
        <Select
            items={items}
            variant="bordered"
            isMultiline
            isRequired={isRequired}
            isInvalid={isInvalid}
            errorMessage={isInvalid ? 'Select an item' : ''}
            selectionMode={selectionMode}
            placeholder={placeholder}
            labelPlacement="outside"
            classNames={{
                base: "max-w-xs",
                trigger: "min-h-unit-12 py-2",
            }}
            renderValue={customRender}
            selectedKeys={selectedKeys}
            onSelectionChange={onSelectionChange}
        >
            {(item) => {
                const key = getKeyValue(item, keyField || 'id');
                const textValue = getKeyValue(item, textValueField || 'name');
                return (
                    <SelectItem key={key} textValue={textValue}>
                        {expandedCustomRender ? expandedCustomRender(item) : textValue}
                    </SelectItem>
                )
            }}
        </Select>
    );
  }
