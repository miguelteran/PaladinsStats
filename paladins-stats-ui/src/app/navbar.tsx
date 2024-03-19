'use client'

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@nextui-org/react";


interface NavBarItem {
    uri: string;
    displayText: string;
}

const navBarItems: NavBarItem[] = [
    { uri: '/search', displayText: 'Search Players' },
    { uri: '/ranked-stats', displayText: 'Ranked Stats' }
]


export function NavBar() {

    const [ isMenuOpen, setIsMenuOpen ] = useState(false);
    const pathname = usePathname();

    return (
        <Navbar 
            isBordered 
            isMenuOpen={isMenuOpen} 
            onMenuOpenChange={setIsMenuOpen}
            maxWidth="full"
            className="px-8"
            classNames={{
                item: [
                  "flex",
                  "relative",
                  "h-full",
                  "items-center",
                  "data-[active=true]:after:content-['']",
                  "data-[active=true]:after:absolute",
                  "data-[active=true]:after:bottom-0",
                  "data-[active=true]:after:left-0",
                  "data-[active=true]:after:right-0",
                  "data-[active=true]:after:h-[2px]",
                  "data-[active=true]:after:rounded-[2px]",
                  "data-[active=true]:after:bg-primary",
                ],
              }}
        >
            <NavbarBrand>
                <p className="font-bold">PALADINS STATS</p>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-8">
                {navBarItems.map(item => (
                    <NavbarItem key={item.uri} isActive={pathname === item.uri}>
                        <Link href={item.uri}>{item.displayText}</Link>
                    </NavbarItem> 
                ))}
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />
            </NavbarContent>
            <NavbarMenu>
                {navBarItems.map((item) => (
                    <NavbarMenuItem key={item.uri}>
                        <Link
                            className="w-full"
                            href={item.uri}
                            size="lg"
                        >
                            {item.displayText}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
}
