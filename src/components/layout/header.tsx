import { Leaf } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 px-6 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Leaf className="h-6 w-6 text-primary-foreground fill-primary" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            BiyoQuiz Ai
          </h1>
        </Link>
      </div>
    </header>
  );
}
