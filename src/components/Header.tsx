import { Link } from 'react-router-dom';
import { LogIn, LogOut, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVigia } from '@/contexts/VigiaContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { currentUser, logout } = useVigia();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">VIGIA</h1>
            <p className="text-xs text-muted-foreground">Vigilância Integrada</p>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost">Início</Button>
          </Link>
          
          {currentUser?.isAdmin && (
            <Link to="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
          )}

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  {currentUser.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button>
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
