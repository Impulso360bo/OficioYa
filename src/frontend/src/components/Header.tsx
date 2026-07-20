import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown, HardHat, LogOut, Search, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function Header() {
  const navigate = useNavigate();
  const { identity, login, clear } = useInternetIdentity();
  const { profile } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const search = useSearch({ strict: false }) as {
    q?: string;
    cat?: string;
    loc?: string;
  };
  const [inputValue, setInputValue] = useState(search.q ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync input when URL q param changes externally
  useEffect(() => {
    setInputValue(search.q ?? "");
  }, [search.q]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      navigate({
        to: "/",
        search: (prev: { q?: string; cat?: string; loc?: string }) => ({
          ...prev,
          q: value || undefined,
          cat: prev.cat,
          loc: prev.loc,
        }),
      });
    },
    [navigate],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    handleSearch(inputValue);
  };

  const handleLogout = () => {
    clear();
    setMenuOpen(false);
    navigate({ to: "/login" });
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-card shadow-sm"
      data-ocid="main-header"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          search={{ q: undefined, cat: undefined, loc: undefined }}
          className="flex shrink-0 items-center gap-2 group"
          aria-label="BuscaOficio — Inicio"
          data-ocid="nav-logo"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HardHat className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg text-foreground hidden sm:block group-hover:text-primary transition-colors duration-200">
            BuscaOficio
          </span>
        </Link>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 max-w-2xl"
          aria-label="Buscar trabajos"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar por oficio, ciudad o empresa..."
              className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary pl-9 pr-4 font-body"
              value={inputValue}
              onChange={handleChange}
              aria-label="Buscar trabajos"
              data-ocid="search-input"
            />
          </div>
        </form>

        {/* Auth section */}
        <nav className="flex items-center gap-2 shrink-0">
          {identity && profile ? (
            /* Logged in + registered: user menu */
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors duration-200 text-sm"
                data-ocid="user-menu-trigger"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="font-medium text-foreground hidden sm:block max-w-[120px] truncate">
                  {profile.name}
                </span>
                <span
                  className={cn(
                    "role-badge hidden sm:inline-flex",
                    profile.role === UserRole.Trabajador
                      ? "trabajador"
                      : "cliente",
                  )}
                >
                  {profile.role === UserRole.Trabajador
                    ? "Trabajador"
                    : "Cliente"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    menuOpen && "rotate-180",
                  )}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
                  <Link
                    to="/perfil"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                    data-ocid="menu-perfil"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Mi Perfil
                  </Link>
                  <div className="border-t border-border my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-200"
                    data-ocid="menu-logout"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : identity && !profile ? (
            /* Logged in but not registered */
            <Link to="/registro">
              <Button
                size="sm"
                variant="outline"
                data-ocid="btn-complete-register"
              >
                Completar registro
              </Button>
            </Link>
          ) : (
            /* Not logged in */
            <Button size="sm" onClick={() => login()} data-ocid="btn-login">
              Iniciar sesión
            </Button>
          )}

          {/* Empleos link (desktop) */}
          <Link
            to="/"
            search={{ q: undefined, cat: undefined, loc: undefined }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-200 hover:bg-muted hover:text-foreground text-muted-foreground hidden md:block",
            )}
            data-ocid="nav-home"
          >
            Empleos
          </Link>
        </nav>
      </div>
    </header>
  );
}
