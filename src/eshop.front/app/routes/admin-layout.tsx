import { Link, Outlet, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Settings, 
  Store,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";

/**
 * Layout pour le back-office admin avec sidebar collapsable
 * La sidebar peut être réduite/étendue sur desktop et masquée/affichée sur mobile
 */
export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Sur mobile, on ne permet pas le collapse, uniquement ouvert/fermé
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Sur mobile, on force expanded quand la sidebar est ouverte
      if (window.innerWidth < 1024) {
        setCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/admin/products", label: "Produits", icon: Package },
    { path: "/admin/orders", label: "Commandes", icon: ShoppingCart },
    { path: "/admin/customers", label: "Clients", icon: Users },
    { path: "/admin/categories", label: "Catégories", icon: Tag },
    { path: "/admin/settings", label: "Paramètres", icon: Settings },
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/80">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Fermer la sidebar"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl 
          flex flex-col shadow-2xl lg:shadow-none
          transform transition-all duration-300 ease-in-out
          border-r border-slate-200/50 dark:border-slate-800/50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed && !isMobile ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className={`
          h-16 flex items-center justify-between
          border-b border-slate-200/50 dark:border-slate-800/50
          ${collapsed && !isMobile ? 'px-4 justify-center' : 'px-6'}
        `}>
          <Link to="/admin" className={`
            flex items-center gap-3 overflow-hidden whitespace-nowrap
            ${collapsed && !isMobile ? 'justify-center' : ''}
          `}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 shrink-0">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className={`
              text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300
              transition-all duration-300
              ${collapsed && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}>
              TechStore
            </span>
          </Link>
          
          {/* Bouton fermer (mobile uniquement) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center rounded-xl 
                    transition-all duration-200 relative
                    ${collapsed && !isMobile ? 'justify-center px-3 py-3.5' : 'gap-3 px-4 py-3'}
                    ${active
                      ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/30"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }
                  `}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <Icon className={`
                    h-5 w-5 shrink-0
                    ${active ? '' : 'group-hover:scale-110 transition-transform'}
                  `} />
                  
                  {/* Label - masqué quand collapsed */}
                  <span className={`
                    font-medium text-sm whitespace-nowrap overflow-hidden
                    transition-all duration-300
                    ${collapsed && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                  `}>
                    {item.label}
                  </span>
                  
                  {/* Indicateur actif */}
                  {active && !collapsed && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-white shrink-0 shadow-sm" />
                  )}
                  
                  {/* Tooltip quand collapsed */}
                  {collapsed && !isMobile && (
                    <div className="
                      absolute left-full ml-3 px-3 py-2 
                      bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg shadow-xl
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 whitespace-nowrap z-50
                      pointer-events-none
                    ">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={`
          border-t border-slate-200/50 dark:border-slate-800/50 space-y-3
          ${collapsed && !isMobile ? 'p-2' : 'p-4'}
        `}>
          {/* Stats - masqué quand collapsed */}
          <div className={`
            bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl overflow-hidden transition-all duration-300 border border-primary/10
            ${collapsed && !isMobile ? 'h-0 opacity-0 p-0 mb-0' : 'h-auto opacity-100 p-4 mb-2'}
          `}>
            <p className="text-xs font-semibold text-primary/80 mb-1.5">Statistiques rapides</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">24</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Commandes aujourd'hui</p>
          </div>
          
          {/* Bouton toggle collapse (desktop uniquement) */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleCollapse}
            className={`
              w-full justify-center hidden lg:flex hover:bg-slate-100 dark:hover:bg-slate-800
              ${collapsed ? 'px-2' : 'justify-between'}
            `}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <span className="text-xs font-medium">Réduire</span>
                <ChevronLeft className="h-4 w-4" />
              </>
            )}
          </Button>
          
          {/* Lien boutique */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => { window.location.href = '/'; }}
            className={`
              border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800
              ${collapsed && !isMobile ? 'justify-center w-10 px-0' : 'justify-start w-full'}
            `}
            title={collapsed && !isMobile ? "Retour à la boutique" : undefined}
          >
            <Store className="h-4 w-4 shrink-0" />
            <span className={`
              ml-2 whitespace-nowrap overflow-hidden transition-all duration-300
              ${collapsed && !isMobile ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}
            `}>
              Retour à la boutique
            </span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-sm">
          <div className="h-full flex items-center justify-between px-4 lg:px-8 gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Bouton toggle sidebar (desktop) */}
              <Button 
                variant="ghost" 
                size="icon"
                className="hidden lg:flex hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={toggleCollapse}
              >
                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
              
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Panneau d'administration
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gérez votre boutique</p>
              </div>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-lg">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Rechercher des produits, commandes..." 
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-slate-400"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => { window.location.href = '/'; }}
              >
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Voir la boutique</span>
              </Button>
              
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
              </Button>
              
              <div className="hidden sm:flex items-center gap-3 pl-3 ml-2 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Admin</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">admin@techstore.com</p>
                </div>
                <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
