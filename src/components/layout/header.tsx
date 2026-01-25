import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Samba CRM
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/projects"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Проекты
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              О нас
            </Link>
            <Link
              href="/contacts"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Контакты
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/cabinet/login">Личный кабинет</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
