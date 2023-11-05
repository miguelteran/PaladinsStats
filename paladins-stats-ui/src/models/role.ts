export enum PaladinsRoles {
    SUPPORT = 'Paladins Support',
    FRONTLINE = 'Paladins Front Line',
    DAMAGE = 'Paladins Damage',
    FLANKER = 'Paladins Flanker'
}

export interface Role {
    role: PaladinsRoles;
    displayValue: string;
}

export const paladinsRoles: Role[] = [
    { role: PaladinsRoles.SUPPORT, displayValue: 'Support' },
    { role: PaladinsRoles.FRONTLINE, displayValue: 'Frontline' },
    { role: PaladinsRoles.DAMAGE, displayValue: 'Damage' },
    { role: PaladinsRoles.FLANKER, displayValue: 'Flanker' }
]
