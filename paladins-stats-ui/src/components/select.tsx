'use client'

import { Key, ReactNode } from 'react';
import { Select, Selection, SelectItem, SelectedItems, getKeyValue } from '@nextui-org/react';


export interface CustomSelectItem {
    key: Key,
    textValue: string
}

export interface CustomSelectProps<T> {
    items: T[],
    keyField: string,
    textValueField: string,
    placeholder: string,
    selectionMode?: 'single' | 'multiple',
    selectedKeys: 'all' | Iterable<Key>,
    onSelectionChange: (keys: Selection) => any;
    customRender?: (items: SelectedItems<T>) => ReactNode;
    expandedCustomRender?: (item: T) => JSX.Element;
}

export function CustomSelect<T>(props: CustomSelectProps<T>) {
    
    const { items, keyField, textValueField, selectionMode, placeholder, selectedKeys, onSelectionChange, customRender, expandedCustomRender } = props;

    return (
        <Select
            items={items}
            variant="bordered"
            isMultiline={true}
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
                const key = getKeyValue(item, keyField);
                const textValue = getKeyValue(item, textValueField);
                return (
                    <SelectItem key={key} textValue={textValue}>
                        {expandedCustomRender ? expandedCustomRender(item) : textValue}
                    </SelectItem>
                )
            }}
        </Select>
    );
  }
