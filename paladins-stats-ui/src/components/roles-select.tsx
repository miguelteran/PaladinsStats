'use client'

import { Selection } from "@nextui-org/react";
import { paladinsRoles } from "@/models/role";
import { CustomSelect, OnSelectionChange } from "./select";


export interface RolesMultiSelectProps {
    selectedRoles: Selection;
    onSelectedRolesChange: OnSelectionChange;
}

export function RolesSelect(props: RolesMultiSelectProps) {

    const { selectedRoles, onSelectedRolesChange } = props;

    return(
        <CustomSelect
            items={paladinsRoles}
            placeholder='Roles'
            selectedKeys={selectedRoles}
            onSelectionChange={onSelectedRolesChange}
        />
    );
}
