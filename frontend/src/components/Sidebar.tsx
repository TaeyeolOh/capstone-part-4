"use client";


import {
 Home,
 Users,
 Calendar,
 Battery,
 Award,
 BarChart2,
 Upload,
 Car,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import evolocityLogo from "../assets/Evolocity.webp";
import { useAtlasSync } from "../hooks/useAtlasSync";
import { UploadToAtlasDialog } from "../components/UploadToAtlasDialog";
import { useState } from "react";
import { useUploadQueue } from "../hooks/useUploadQueue";


interface SidebarProps {
 open: boolean;
 setOpen: (open: boolean) => void;
}


const Sidebar = ({ open, setOpen }: SidebarProps) => {
 const location = useLocation();
 const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
 const { uploadToAtlas } = useAtlasSync();
 const { status, timestamp, triggerUpload } = useUploadQueue(uploadToAtlas);


 const navItems = [
   { name: "Dashboard", icon: <Home size={20} />, path: "/" },
   { name: "Teams", icon: <Users size={20} />, path: "/teams" },
   { name: "Vehicles", icon: <Car size={20} />, path: "/vehicles" },
   {
     name: "Competitions",
     icon: <Calendar size={20} />,
     path: "/competitions",
   },
   { name: "Energy Monitors", icon: <Battery size={20} />, path: "/monitors" },
   { name: "Race Results", icon: <Award size={20} />, path: "/results" },
   {
     name: "Energy Data",
     icon: <BarChart2 size={20} />,
     path: "/energy-data",
   },
 ];


 const isActive = (path: string) => {
   return location.pathname === path;
 };


 return (
   <>
     {/* Mobile backdrop */}
     {open && (
       <div
         className="fixed inset-0 z-20 bg-black bg-opacity-70 backdrop-blur-sm md:hidden"
         onClick={() => setOpen(false)}
       ></div>
     )}


     {/* Sidebar */}
     <div
       className={`fixed inset-y-0 left-0 z-30 w-64 bg-dark-400 border-r border-dark-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:z-auto ${
         open ? "translate-x-0" : "-translate-x-full"
       }`}
     >
       <div className="flex flex-col h-full">
         <div className="flex items-center justify-center h-20 border-b border-dark-100">
           <img
             src={evolocityLogo || "/placeholder.svg"}
             alt="Evolocity Logo"
             className="h-10"
           />
         </div>


         <nav className="flex-1 px-4 py-6 space-y-1.5">
           {navItems.map((item) => (
             <Link
               key={item.name}
               to={item.path}
               className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                 isActive(item.path)
                   ? "bg-gradient-to-r from-dark-100 to-dark-200 text-light-100 shadow-card"
                   : "text-light-500 hover:bg-dark-200 hover:text-light-100"
               }`}
               onClick={() => setOpen(false)}
             >
               <span
                 className={`mr-3 ${
                   isActive(item.path) ? "text-accent2-DEFAULT" : ""
                 }`}
               >
                 {item.icon}
               </span>
               <span className="font-medium">{item.name}</span>
               {isActive(item.path) && (
                 <span className="ml-auto h-2 w-2 rounded-full bg-accent2-DEFAULT"></span>
               )}
             </Link>
           ))}
         </nav>
         <div className="mt-auto px-4 py-4 border-t border-dark-100">
           <button
             onClick={() => setUploadDialogOpen(true)}
             className="flex items-center w-full px-4 py-3 rounded-lg text-light-500 hover:bg-dark-200 hover:text-light-100 transition-all duration-200"
           >
             <Upload size={18} className="mr-3" />
             <span className="font-medium text-sm">Upload to Cloud</span>
           </button>
         </div>
       </div>
     </div>
     <UploadToAtlasDialog
       open={uploadDialogOpen}
       onConfirm={async () => {
         setUploadDialogOpen(false);
         await triggerUpload();
       }}
       onCancel={() => setUploadDialogOpen(false)}
       status={status}
       timestamp={timestamp}
     />
   </>
 );
};


export default Sidebar;
