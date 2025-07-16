import { useEffect, useState } from 'react'

import { menuItems } from '../constants';
import SubSidebar from './SubSidebar';
const Sidebar = ({ isSidebarToggled }: { isSidebarToggled: boolean }) => {
    const linkStyle='flex flex-col items-center gap-1.5 border-b pb-4 border-gray-100 pb-5 pt-8 pl-4 cursor-pointer'
    const [activeMainMenuItemId, setActiveMainMenuItemId] = useState<string | null>('');
    const [toggleSubSidebar,setToggleSubSidebar]=useState(false);
    const handleActiveMainMenuItemId = (itemId: string) => {
      setActiveMainMenuItemId(itemId)
      setToggleSubSidebar(true)
    }
    useEffect(()=>{
      if (!isSidebarToggled){
        setActiveMainMenuItemId(null);


        
        setToggleSubSidebar(false);
      }
    },[isSidebarToggled])
  return (
   <div className='flex h-full '>
     <ul className='custom-sidebar-scroll  w-28 overflow-y-auto bg-white font-nunito shadow-lg  border pt-6 border-gray-200 flex flex-col  h-full '>  
           {menuItems.map((item,_index)=>(
            <li key={item.id} className={linkStyle} onClick={()=>handleActiveMainMenuItemId(item.id)}>
                <item.icon className='text-gray-500' size={28} />
                <p className={`text-gray-700  text-sm truncate w-full  `}>{item.title}</p>
            </li>
           ))}
    </ul>
    {toggleSubSidebar && <SubSidebar itemId={activeMainMenuItemId ?? ''} />}

   </div>
  )
}

export default Sidebar