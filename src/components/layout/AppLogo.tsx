
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  iconOnly?: boolean;
  className?: string;
}

export function AppLogo({ iconOnly = false, className }: AppLogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div 
        className={cn(
          "relative",
          iconOnly ? "h-8 w-8" : "h-10 w-auto",
          // Attempt to make SVG white in dark mode using filters
          // This targets the Image component directly
          "dark:[&_img]:brightness-0 dark:[&_img]:invert dark:[&_img]:contrast-200"
        )}
        style={!iconOnly ? { minWidth: '120px' } : {}}
      >
        <Image 
          src="http://mdtbmw.heytek.ng/wp-content/uploads/2025/06/heylogo.svg" 
          alt="HeyTek Logo" 
          fill 
          sizes={iconOnly ? "32px" : "(max-width: 768px) 120px, 150px"}
          className="object-contain transition-transform group-hover:scale-105"
          priority 
        />
      </div>
    </Link>
  );
}
