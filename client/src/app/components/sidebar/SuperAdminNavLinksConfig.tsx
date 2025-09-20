// navLinksSuperAdmin.ts
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  CreditCardOutlined,
  PlusOutlined,
  TeamOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { NavLink } from "./NavLinksConfig";

export const superAdminNavLinks: NavLink[] = [
  {
    label: "Dashboard",
    href: "/super-admin/dashboard",
    icon: <DashboardOutlined />,
    category: "Main",
  },
  {
    label: "Firms",
    href: "/super-admin/get-firms",
    icon: <BankOutlined />,
    category: "Main",
  },
  {
    label: "Lawyers",
    href: "/super-admin/get-lawyers",
    icon: <TeamOutlined />,
    category: "Main",
  },
  {
    label: "Clients",
    href: "/super-admin/get-clients",
    icon: <UserOutlined />,
    category: "Main",
  },
  {
    label: "Cases",
    href: "/super-admin/get-cases",
    icon: <FileTextOutlined />,
    category: "Main",
  },
];
