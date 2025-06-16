
'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('heytek-theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    } else {
      setTheme('light'); // Default to light if no preference/storage
    }
  }, []);

  useEffect(() => {
    if (mounted) { 
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('heytek-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('heytek-theme', 'light');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  if (!mounted) { 
    return <div className="h-9 w-9 rounded-md border border-input bg-background"></div>; 
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:border-border dark:text-primary dark:hover:bg-primary/10 dark:hover:text-primary-foreground"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  );
}
