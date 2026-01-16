import { useState } from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { FaRegUserCircle } from "react-icons/fa";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";

const HeaderComp = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-[#020617]/95 via-[#020617]/90 to-[#020617]/95 border-b border-white/10">
      <div className="max-w-7xl mx-auto h-[72px] flex items-center justify-between px-4 sm:px-12">
        {/* Logo */}
        <Link to="/flight-demo" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="h-9 sm:h-10 w-auto drop-shadow-lg brightness-125 contrast-125"
          />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-12 text-gray-200 text-sm font-semibold tracking-wide">
          <Link
            to="/customer-support"
            className="flex items-center gap-1 hover:text-cyan-400 transition-all duration-200"
          >
            Customer Support
            <IoIosArrowDown className="text-xs opacity-70 mt-[1px]" />
          </Link>

          <Link
            to="/explore"
            className="flex items-center gap-1 hover:text-cyan-400 transition-all duration-200"
          >
            Explore
            <IoIosArrowDown className="text-xs opacity-70 mt-[1px]" />
          </Link>

          {/* User */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 cursor-pointer transition backdrop-blur-md">
            <FaRegUserCircle className="text-lg text-cyan-400" />
            <span className="text-sm font-semibold">
              Hi, <span className="text-cyan-400">Travsol</span>
            </span>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-200 text-2xl"
        >
          {menuOpen ? <HiX /> : <HiOutlineMenuAlt3 />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#020617]/95 backdrop-blur-xl border-t border-white/10">
          <div className="flex flex-col px-6 py-4 gap-4 text-gray-200 text-sm font-semibold">
            <Link
              to="/customer-support"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between hover:text-cyan-400"
            >
              Customer Support
              <IoIosArrowDown className="opacity-70" />
            </Link>

            <Link
              to="/explore"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between hover:text-cyan-400"
            >
              Explore
              <IoIosArrowDown className="opacity-70" />
            </Link>

            {/* User */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <FaRegUserCircle className="text-xl text-cyan-400" />
              <span>
                Hi, <span className="text-cyan-400 font-semibold">Travsol</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderComp;
