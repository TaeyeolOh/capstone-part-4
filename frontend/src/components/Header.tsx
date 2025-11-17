import { Menu, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"


interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  userName?: string
}
// Need to pass in actual user name as a prop, need to decide as a team whether we will need to log in or not?
const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }


    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserMenuOpen])

  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isUserMenuOpen])

  return (
    <>
      <header className="bg-dark-400 border-b border-dark-100 py-4 px-6 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-light-500 hover:text-light-100 focus:outline-none md:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold ml-4 md:ml-0 tracking-tight">
            <span className="text-gradient">EVolocity - Race Manager / Kaiwhakahaere Rēhi</span>
          </h1>
        </div>
  
      </header>
    </>
  );  
}

export default Header


