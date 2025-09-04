
"use client"

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Car } from "lucide-react";


export function MobileHeader() {
  const { setOpenMobile } = useSidebar();
  return (
     <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
        <Button 
          variant="ghost" 
          className="md:hidden"
          onClick={() => setOpenMobile(true)}
        >
          <Car className="h-12 w-12 text-primary mr-2" />
          <span className="font-semibold">Menu</span>
        </Button>
      </header>
  );
}
