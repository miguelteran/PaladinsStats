'use client'

import { CustomSelect, CustomSelectProps } from './select';
import { useCallback } from 'react';
import { SelectedItems, Chip } from '@nextui-org/react';


export type CustomMultiSelectProps<T> = Omit<CustomSelectProps<T>, 'selectionMode'|'customRender'>

export function CustomMultiSelect<T>(props: CustomMultiSelectProps<T>) {
    
    const { items, keyField, textValueField, placeholder, selectedKeys, onSelectionChange, expandedCustomRender } = props;

    const renderValue = useCallback((items: SelectedItems<T>) => {
        return (
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (<Chip key={item.key}>{item.textValue}</Chip>))}
            </div>
        );
    }, []);

    return (
        <CustomSelect<T>
            items={items}
            keyField={keyField}
            textValueField={textValueField}
            placeholder={placeholder}
            selectionMode='multiple'
            selectedKeys={selectedKeys}
            onSelectionChange={onSelectionChange}
            customRender={renderValue}
            expandedCustomRender={expandedCustomRender}
        />
    );
  }
