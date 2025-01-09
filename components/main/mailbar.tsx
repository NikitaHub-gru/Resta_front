"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, useSidebar } from "../ui/sidebar";
import {
  IconArrowLeft,
  IconHome,
  IconLayoutDashboardFilled,
  IconReportAnalytics,
  IconFileTypeDoc,
  IconSettings,
  IconUserBolt,
  IconShoppingCartSearch,
  IconUsers,
  IconGitPullRequestDraft,
  IconCalendarStar,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getAuthUser } from "@/hooks/getauthuser";

interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  };
}

interface UserData {
  name: string;
  email: string;
  corporation: string;
  role: string;
}

export function SidebarDemo({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    corporation: "",
    role: "",
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = (await getAuthUser()) as {
        email: string | undefined;
        name: any;
        corporation: any;
        role: string;
      };
      setUserData({
        name: user?.name || "",
        email: user?.email || "",
        corporation: user?.corporation || "RestaLabs",
        role: user?.role || "",
      });
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      router.push("/login");
    }
  };

  const links = [
    {
      label: "Главная",
      href: "/",
      icon: (
        <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    ...(userData.corporation === "RestaLabs"
      ? [
          {
            label: "Поиск заказов",
            href: "/orders",
            icon: (
              <IconShoppingCartSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          },
          {
            label: "Отчеты",
            href: "/reports",
            icon: (
              <IconLayoutDashboardFilled className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          },
          {
            label: "История",
            href: "/history",
            icon: (
              <IconCalendarStar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          },
        ]
      : userData.corporation === "Grill№1"
      ? [
          {
            label: "Поиск заказов",
            href: "/orders",
            icon: (
              <IconShoppingCartSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          },
        ]
      : userData.corporation === "Грильница"
      ? [
          {
            label: "Отчеты",
            href: "/reports",
            icon: (
              <IconLayoutDashboardFilled className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          },
          {
            label: "История",
            href: "/history",
            icon: (
              <IconCalendarStar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          },
        ]
      : [
          {
            label: "Отчеты",
            href: "/reports",
            icon: (
              <IconLayoutDashboardFilled className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          },
        ]),

    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconReportAnalytics className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const adminLinks = [
    {
      label: "Админка",
      href: "#",
      className: "py-4 gap-2 ",
    },
    {
      label: "Настройки",
      href: "/reportsSettings",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Пользователи",
      href: "/users",
      icon: (
        <IconUsers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Документация",
      href: "/docs",
      icon: (
        <IconFileTypeDoc className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const Engineerlinks = [
    {
      label: "Инженеры",
      href: "#",
      className: "py-4 gap-2 ",
    },
    {
      label: "API",
      href: "/request",
      icon: (
        <IconGitPullRequestDraft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-2">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo userData={userData} /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
            {userData.role === "Admin" && (
              <div className="mt-8 flex justify-start flex-col gap-2">
                {adminLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            )}
            {(userData.role === "Engineer" || userData.role === "Admin") && (
              <div className="mt-8 flex justify-start flex-col gap-2">
                {Engineerlinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            )}
          </div>

          <div>
            <SidebarLink
              link={{
                label: userData.name,
                href: "#",
                icon: (
                  <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
                ),
              }}
            />
          </div>
          <div className="flex flex-col gap-2 justify-end">
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: (
                  <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
                onClick: handleLogout,
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}
export const Logo = ({
  userData,
}: {
  userData: { name: string; email: string; corporation: string };
}) => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        {userData.corporation}
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

// Dummy dashboard component with content

const SidebarLink = ({ link }: SidebarLinkProps) => {
  const { open } = useSidebar();
  const handleClick = (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
  };

  return (
    <Link
      href={link.href}
      onClick={handleClick}
      className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3 py-2 rounded-lg transition-all duration-150"
    >
      {link.icon}
      {open && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm font-medium"
        >
          {link.label}
        </motion.span>
      )}
    </Link>
  );
};
