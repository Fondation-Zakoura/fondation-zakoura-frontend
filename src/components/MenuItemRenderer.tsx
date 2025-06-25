// src/components/MenuItemRenderer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io'; // Icons for dropdown arrows

// --- 1. Helper Component: Renders a standard clickable link item ---
const LinkItem = ({ item, depth }) => {
    // Calculate padding based on depth for visual indentation
    const paddingLeft = `${(depth * 16) + 20}px`; 

    return (
        <li className="sub-menu-item py-2 hover:bg-gray-100 flex items-center" style={{ paddingLeft: paddingLeft }}>
            <Link to={item.link} className="block w-full text-gray-700 hover:text-blue-600 flex items-center truncate w-48">
                {/* Conditionally render icon if it exists for this item */}
                {item.icon && <span className="mr-2"><item.icon /></span>}
                {item.title}
            </Link>
        </li>
    );
};

// --- 2. Helper Component: Renders a non-clickable header/separator item ---
const HeaderItem = ({ item, depth }) => {
    // Calculate padding based on depth for visual indentation
    const paddingLeft = `${(depth * 16) + 20}px`; // Adjust 20px base padding as needed

    return (
        <li className="flex items-center py-3  text-sm font-semibold text-gray-500 uppercase -b mt-2 mb-1" style={{ paddingLeft: paddingLeft }}>
           <IoIosArrowDown /> {item.title}
        </li>
    );
};

// --- 3. Helper Component: Renders a dropdown item (this is the recursive part) ---
const DropdownItem = ({ item, depth }) => {
    const [isOpen, setIsOpen] = useState(false); // Manages if this specific dropdown is open or closed

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Calculate padding based on depth for visual indentation
    const paddingLeft = `${(depth * 16) + 20}px`; 

    return (
        <li className="sub-menu-dropdown-item">
            <div
                className="py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                onClick={toggleDropdown}
                style={{ paddingLeft: paddingLeft }} // Apply dynamic padding
            >
                 {isOpen ? <IoIosArrowDown size={14} /> : <IoIosArrowForward size={14} />}
                <div className="flex items-center">
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    <span className="text-gray-700 truncate">{item.title}</span>
                </div>
                
               
            </div>
            {/* If the dropdown is open AND it has nested items, render them */}
            {isOpen && item.nestedDropdownItems && (
                <ul className="py-1 "> {/* Styling for the nested list */}
                    {item.nestedDropdownItems.map((nestedItem) => (
                        // !!! THIS IS THE RECURSIVE CALL !!!
                        // We render another MenuItemRenderer for each nested item,
                        // incrementing the 'depth' to push it further in.
                        <MenuItemRenderer key={nestedItem.id} item={nestedItem} depth={depth + 1} />
                    ))}
                </ul>
            )}
        </li>
    );
};

interface MenuItemRendererProps {
  item: MenuItem; // The item can be ANY of the MenuItem union types
  depth: number;
}

// --- The main MenuItemRenderer component ---
// This is the component you import and use in SubSidebar.jsx
const MenuItemRenderer:React.FC<MenuItemRendererProps> = ({ item, depth = 0 }) => {
    // Based on the 'type' property of the item, render the appropriate helper component
    switch (item.type) {
        case 'header':
            return <HeaderItem item={item} depth={depth} />;
        case 'dropdown':
            return <DropdownItem item={item} depth={depth} />;
        case 'link': 
        default: // If no type is specified, default to a regular link
            return <LinkItem item={item} depth={depth} />;
    }
};

export default MenuItemRenderer;