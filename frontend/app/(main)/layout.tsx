import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex flex-col gap-2 overflow-x-auto overflow-y-hidden p-2 md:gap-4 md:p-4">
        {children}
      </SidebarInset>
    </>
  );
}
