import { Icons } from '@/components/icons';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold font-headline">Project Pilot AI</span>
        </div>
      </div>
    </header>
  );
}
