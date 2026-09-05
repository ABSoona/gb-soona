import { NavGroup } from '@/components/layout/nav-group';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import logo from '../../assets/logo.png';
import { useSidebarData } from './data/sidebar-data';


export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { navGroups } = useSidebarData();

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <span className="app-name font-manrope text-2xl font-black tracking-[0.35em] text-white translate-x-2 uppercase">Mizana</span>
        <img className="logo" src={logo} alt="Logo" />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}