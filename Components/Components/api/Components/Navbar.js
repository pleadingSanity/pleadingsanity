import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black bg-opacity-80 border-b-2 border-cyan-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🧠</span>
              <span className="text-cyan-400 font-bold text-xl tracking-wide">
                Pleading Sanity
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-fuchsia-400">
              Home
            </Link>
            <Link href="/sanity-hub" className="text-white hover:text-fuchsia-400">
              Sanity Hub
            </Link>
            <Link href="/shop" className="text-white hover:text-fuchsia-400">
              Shop
            </Link>
            <Link href="/movement" className="text-white hover:text-fuchsia-400">
              Movement
            </Link>
            <Link href="/journal-vault" className="text-white hover:text-fuchsia-400">
              Journal Vault
            </Link>
            <Link href="/games" className="text-white hover:text-fuchsia-400">
              Games
            </Link>
            <Link href="/feed" className="text-white hover:text-fuchsia-400">
              Feed
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-cyan-400 hover:text-fuchsia-400 focus:outline-none"
            >
              {isOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black bg-opacity-95 px-4 py-3 space-y-2 border-t border-cyan-400">
          <Link href="/" className="block text-white hover:text-fuchsia-400">
            Home
          </Link>
          <Link href="/sanity-hub" className="block text-white hover:text-fuchsia-400">
            Sanity Hub
          </Link>
          <Link href="/shop" className="block text-white hover:text-fuchsia-400">
            Shop
          </Link>
          <Link href="/movement" className="block text-white hover:text-fuchsia-400">
            Movement
          </Link>
          <Link href="/journal-vault" className="block text-white hover:text-fuchsia-400">
            Journal Vault
          </Link>
          <Link href="/games" className="block text-white hover:text-fuchsia-400">
            Games
          </Link>
          <Link href="/feed" className="block text-white hover:text-fuchsia-400">
            Feed
          </Link>
        </div>
      )}
    </nav>
  );
}
