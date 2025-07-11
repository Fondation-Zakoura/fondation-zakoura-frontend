// MainLayout.tsx
import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header"; // Assuming Header.tsx
import { Link, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Assuming Sidebar.tsx

/**
 * MainLayout component provides the primary layout structure for the application,
 * including a header, a sidebar with toggle functionality, and a main content area.
 *
 * Features:
 * - Responsive sidebar that can be toggled open or closed.
 * - Closes the sidebar automatically when clicking outside of it or the menu button.
 * - Uses React refs to manage sidebar and menu button DOM nodes for click detection.
 * - Integrates a Header component that triggers sidebar toggling.
 * - Renders child routes/content via <Outlet />.
 *
 * State:
 * - isSidebarToggled: Boolean indicating whether the sidebar is open.
 *
 * @component
 * @returns {JSX.Element} The main layout structure with header, sidebar, and main content.
 */
const MainLayout: React.FC = () => {
  // Added React.FC for better type checking of the component itself
  // State to track if the sidebar is toggled open or closed
  const [isSidebarToggled, setIsSidebarToggled] = useState<boolean>(false); // Explicitly typed as boolean

  // Ref for the sidebar DOM node
  // Assuming the sidebar 'aside' element can be generically an HTMLElement, or more specifically HTMLAsideElement
  const sidebarRef = useRef<HTMLElement>(null); // Typed useRef to HTMLElement or HTMLAsideElement

  // Ref for the menu button DOM node
  // Assuming the menu button is a <button> element, type as HTMLButtonElement
  // If it's a <div> or another element acting as a button, adjust the type accordingly (e.g., HTMLDivElement)
  const menuButtonRef = useRef<HTMLButtonElement>(null); // Typed useRef to HTMLButtonElement

  // Function to toggle the sidebar open/closed
  const handleSidebarToggle = () => {
    setIsSidebarToggled((prev) => !prev);
  };

  // Effect to close the sidebar when clicking outside of it or the menu button
  useEffect(() => {
    if (!isSidebarToggled) return;

    // Handler to detect clicks outside sidebar and menu button
    // The 'event' parameter is a MouseEvent
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) && // Assert event.target as Node
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsSidebarToggled(false);
      }
    };

    // Add event listener for mouse down
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup event listener on unmount or when sidebar closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarToggled]);

  return (
    <div className="h-full">
      <header className="fixed w-full z-50 ">
        {/* Pass typed props to Header component */}
        <Header
          handleSidebarToggle={handleSidebarToggle}
          menuButtonRef={menuButtonRef}
        />
      </header>
      {/* Sidebar with transition and toggle functionality */}
      <aside
        ref={sidebarRef}
        className={`h-full fixed pt-17 z-20 ${
          isSidebarToggled ? "translate-x-0" : "-translate-x-84 "
        } transition-all ease-in-out duration-400`}
      >
        {/* Pass typed props to Sidebar component */}
        <Sidebar isSidebarToggled={isSidebarToggled} />
      </aside>
      {/* Main content area where routed components are rendered */}
      <main className="relative top-24 lg:mx-3">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

// PageHeaderLayout: A reusable header for pages with breadcrumbs
export interface Breadcrumb {
  label: string;
  active?: boolean;
  url?: string;
}

interface PageHeaderLayoutProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  className?: string;
  children?: React.ReactNode;
}

export const PageHeaderLayout: React.FC<PageHeaderLayoutProps> = ({
  title,
  breadcrumbs,
  className = "",
  children,
}) => (
  <div className={`mb-8 ${className}`}>
    <h2 className="text-2xl font-bold text-[#0B2447] mb-1">{title}</h2>
    <div className="text-sm text-gray-400 flex flex-wrap items-center gap-1">
      {breadcrumbs.map((bc, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="mx-1">|</span>}
          {bc.url ? (
            <Link to={bc.url}>
              <span className={bc.active ? "text-[#19376D] font-semibold" : ""}>
                {bc.label}
              </span>
            </Link>
          ) : (
            <span className={bc.active ? "text-[#19376D] font-semibold" : ""}>
              {bc.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
    {children}
  </div>
);
