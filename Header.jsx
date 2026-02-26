import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTheme } from '@/contexts/ThemeProvider.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Clock, LogOut, User, LayoutDashboard, BarChart2, Calendar as CalendarIcon, Sun, Moon, Menu, X, ListTodo } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.jsx";
const Header = () => {
  const {
    isAuthenticated,
    currentUser,
    logout
  } = useAuth();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const navLinks = isAuthenticated ? [{
    name: 'Dashboard',
    path: '/app',
    icon: <LayoutDashboard className="w-4 h-4 mr-2" />
  }, {
    name: 'Schedule',
    path: '/schedule',
    icon: <ListTodo className="w-4 h-4 mr-2" />
  }, {
    name: 'Calendar',
    path: '/calendar',
    icon: <CalendarIcon className="w-4 h-4 mr-2" />
  }, {
    name: 'Analytics',
    path: '/analytics',
    icon: <BarChart2 className="w-4 h-4 mr-2" />
  }] : [];
  return <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Clock className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl tracking-tight">AslanFlow</span>
            </Link>
            
            {isAuthenticated && <nav className="hidden lg:flex ml-10 space-x-1">
                {navLinks.map(link => <Link key={link.path} to={link.path} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith(link.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                    {link.icon}
                    {link.name}
                  </Link>)}
              </nav>}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {!isAuthenticated ? <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Sign up
                  </Button>
                </Link>
              </div> : <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-muted hover:bg-muted/80">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border text-popover-foreground" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}

            {/* Mobile menu button */}
            {isAuthenticated && <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && mobileMenuOpen && <div className="lg:hidden bg-card border-b border-border px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map(link => <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors ${location.pathname.startsWith(link.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              {link.icon}
              {link.name}
            </Link>)}
        </div>}
    </header>;
};
export default Header;