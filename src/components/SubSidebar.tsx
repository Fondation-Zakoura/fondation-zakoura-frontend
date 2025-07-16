
import React from 'react';
import { menuItems } from '../constants'; 
import MenuItemRenderer from './MenuItemRenderer'; 


interface SubSidebarProps{
    itemId?:string;
}
const SubSidebar:React.FC<SubSidebarProps> = ({ itemId }) => {
    const selectedLink = menuItems.find(item => item.id === itemId);

    if (!selectedLink || !selectedLink.subItems || selectedLink.subItems.length === 0) {
        return null; // Don't render if no sub-items or no selected link
    }

    return (
        <ul className='flex relative flex-col w-68 custom-sidebar-scroll overflow-y-auto bg-white font-nunito rounded-2xl border my-4 mb-0.5 shadow-lg py-4 border-gray-200 '>
            {selectedLink.subItems.map((item) => (
                // MenuItemRenderer handles the specific rendering logic (link, header, dropdown)
                // It will manage its own state for dropdowns if applicable.
                <MenuItemRenderer key={item.id} item={item} depth={0} /> // Start depth at 0 for sub-sidebar items
            ))}
        </ul>
    );
};

export default SubSidebar;