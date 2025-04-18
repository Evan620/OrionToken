import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = ({
  className,
  collapsed = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    // Handle root path and explicitly check for dashboard
    if (path === "/" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === path || location.startsWith(`${path}/`);
  };

  // Sidebar links configuration
  const mainLinks = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/tokenize", icon: "add_circle", label: "Tokenize Assets" },
    { href: "/marketplace", icon: "storefront", label: "Marketplace" },
    { href: "/portfolio", icon: "account_balance_wallet", label: "Portfolio" },
  ];

  const assetLinks = [
    { href: "/assets/real-estate", icon: "apartment", label: "Real Estate" },
    { href: "/assets/invoices", icon: "receipt", label: "Invoices" },
    { href: "/assets/equipment", icon: "precision_manufacturing", label: "Equipment" },
  ];

  const settingLinks = [
    { href: "/compliance", icon: "verified", label: "Compliance" },
    { href: "/settings", icon: "settings", label: "Settings" },
  ];

  // Determine CSS classes for mobile view
  const mobileClasses = mobileOpen
    ? "fixed z-50 top-0 left-0 block"
    : "hidden md:block";

  return (
    <aside
      className={cn(
        "fixed md:fixed w-56 h-full bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30",
        mobileClasses,
        className
      )}
    >
      {/* Logo and brand */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
            <span className="material-icons text-lg">token</span>
          </div>
          <h1 className="ml-2 font-semibold text-lg">OrionToken</h1>
        </div>
        <button
          className="md:hidden text-gray-500 dark:text-gray-400"
          onClick={onMobileClose}
        >
          <span className="material-icons">close</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="py-4 h-[calc(100%-64px)] flex flex-col">
        <div className="px-3 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Main
        </div>
        <ul className="space-y-1">
          {mainLinks.map((link) => (
            <li key={link.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md mx-2 text-sm cursor-pointer",
                  isActive(link.href) &&
                    "text-primary bg-primary/10 dark:bg-primary/20 font-medium"
                )}
                onClick={() => window.location.href = link.href}
              >
                <span className="material-icons text-lg mr-2">{link.icon}</span>
                {link.label}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 px-3 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Asset Management
        </div>
        <ul className="space-y-1">
          {assetLinks.map((link) => (
            <li key={link.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md mx-2 text-sm cursor-pointer",
                  isActive(link.href) &&
                    "text-primary bg-primary/10 dark:bg-primary/20 font-medium"
                )}
                onClick={() => window.location.href = link.href}
              >
                <span className="material-icons text-lg mr-2">{link.icon}</span>
                {link.label}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 px-3 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Settings
        </div>
        <ul className="space-y-1">
          {settingLinks.map((link) => (
            <li key={link.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md mx-2 text-sm cursor-pointer",
                  isActive(link.href) &&
                    "text-primary bg-primary/10 dark:bg-primary/20 font-medium"
                )}
                onClick={() => window.location.href = link.href}
              >
                <span className="material-icons text-lg mr-2">{link.icon}</span>
                {link.label}
              </div>
            </li>
          ))}
        </ul>

        {/* Account info at the bottom */}
        <div className="mt-auto p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="material-icons text-sm text-gray-600 dark:text-gray-400">person</span>
            </div>
            <div className="ml-2">
              <p className="font-medium text-sm">John Smith</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Growth Plan</p>
            </div>
            <button className="ml-auto p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="material-icons text-sm text-gray-500">more_vert</span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;