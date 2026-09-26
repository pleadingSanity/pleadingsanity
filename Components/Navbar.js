import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on page change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/sanity-hub", label: "Sanity Hub" },
    { href: "/journal-vault", label: "Journal Vault" },
    { href: "/frequencies", label: "Healing Hz" },
    { href: "/feed", label: "Feed" },
    { href: "/games", label: "Brain Games" },
    { href: "/movement", label: "The Movement" },
    { href: "/shop", label: "👕 Shop" },
  ];

  return (
    <nav 
      className="sticky top-0 z-50"
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0, 255, 240, 0.3)",
        boxShadow: "0 0 20px rgba(0, 255, 240, 0.15)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg px-2"
            onClick={() => setIsOpen(false)}
            aria-label="Pleading Sanity — Home"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🧠</span>
            <span 
              className="font-bold text-xl tracking-wide"
              style={{
                color: "#00fff0",
                textShadow: "0 0 10px rgba(0, 255, 240, 0.4)",
              }}
            >
              Pleading Sanity
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  style={{
                    color: isActive ? "#00fff0" : "#fff",
                    background: isActive ? "rgba(0, 255, 240, 0.1)" : "transparent",
                    textShadow: isActive ? "0 0 8px rgba(0, 255, 240, 0.5)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#ff00ff";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#fff";
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            style={{
              color: isOpen ? "#ff00ff" : "#00fff0",
              background: isOpen ? "rgba(255, 0, 255, 0.1)" : "transparent",
            }}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close main menu" : "Open main menu"}
          >
            {isOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div 
          className="md:hidden border-t"
          style={{
            background: "rgba(0, 0, 0, 0.95)",
            borderColor: "rgba(0, 255, 240, 0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          <nav aria-label="Mobile navigation" className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className="block px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  style={{
                    color: isActive ? "#00fff0" : "#fff",
                    background: isActive ? "rgba(0, 255, 240, 0.15)" : "transparent",
                    borderLeft: isActive ? "2px solid #00fff0" : "2px solid transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </nav>
  );
}
