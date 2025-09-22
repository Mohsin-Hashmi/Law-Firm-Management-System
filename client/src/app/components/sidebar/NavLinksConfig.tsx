// navLinks.tsx (or navLinksConfig.ts)
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

export interface NavLink {
  label: string;
  href?: string;
  icon: React.ReactNode;
  category: string;
  requiredPermissions?: string[];
  onClick?: () => void;
}

export const navLinks: NavLink[] = [
  // ---------- Main ----------
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardOutlined />,
    category: "Main",
    requiredPermissions: ["view_stats"],
  },
  {
    label: "Add New Business",
    href: "/add-firm",
    icon: <BankOutlined />,
    category: "Business Management",
    requiredPermissions: ["create_firm"],
  },
  {
    label: "View All Business",
    icon: <EyeOutlined />,
    category: "Business Management",
    requiredPermissions: ["view-all-firms"],
  },
  // ---------- Role Management ----------
  {
    label: "Assign Role",
    icon: <UserOutlined />,
    category: "Role Management",
    requiredPermissions: ["assign_role"],
    // You can pass modals here later
  },
  {
    label: "Add New Role",
    icon: <PlusOutlined />,
    category: "Role Management",
    requiredPermissions: ["create_role"],
  },
  {
    label: "View All Users",
    href: "/get-user-roles",
    icon: <EyeOutlined />,
    category: "Role Management",
    requiredPermissions: ["view_role"],
  },

  {
    label: "Lawyers",
    href: "/get-lawyers",
    icon: <UserOutlined />,
    category: "Team Management",
    requiredPermissions: ["read_lawyer"],
  },
  {
    label: "Add Lawyers",
    href: "/add-lawyer",
    icon: <PlusOutlined />,
    category: "Team Management",
    requiredPermissions: ["create_lawyer"],
  },
  {
    label: "Clients",
    href: "/get-clients",
    icon: <TeamOutlined />,
    category: "Client Management",
    requiredPermissions: ["read_client"],
  },
  {
    label: "Cases",
    href: "/get-cases",
    icon: <FileTextOutlined />,
    category: "Case Management",
    requiredPermissions: ["read_case"],
  },

  // ---------- Client ----------
  {
    label: "Add Client",
    href: "/create-client",
    icon: <PlusOutlined />,
    category: "Client Management",
    requiredPermissions: ["create_client"],
  },

  // ---------- Cases ----------
  {
    label: "Add Case",
    href: "/add-case",
    icon: <PlusOutlined />,
    category: "Case Management",
    requiredPermissions: ["create_case"],
  },

  // ---------- Documents ----------
  {
    label: "View Case Documents",
    href: "/",
    icon: <FileTextOutlined />,
    category: "Document Management",
    requiredPermissions: ["view_case_documents"],
  },
  {
    label: "Upload Case Documents",
    href: "/",
    icon: <PlusOutlined />,
    category: "Document Management",
    requiredPermissions: ["upload_case_document"],
  },

  
];
