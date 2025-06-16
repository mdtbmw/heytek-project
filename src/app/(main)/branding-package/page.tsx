
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Download, Image as ImageIcon, Palette, Layers, MonitorPlay } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function BrandingPackagePage() {
  const { toast } = useToast();

  const handleDownload = (assetName: string) => {
    // Mock download functionality
    toast({
      title: `Downloading ${assetName}`,
      description: `Your ${assetName.toLowerCase()} would start downloading now. (This is a mock action)`,
    });
  };

  const handleGenerateWebsite = () => {
    toast({
      title: 'Generating Website Preview (Conceptual)',
      description: 'AI is sketching your website... (This is a mock action, feature coming soon!)',
    });
  };

  const brandingAssets = [
    {
      name: 'Logo Variations',
      description: 'Primary logo, secondary logo, and favicons in various formats.',
      icon: ImageIcon,
      imagePlaceholder: 'https://placehold.co/300x200.png',
      aiHint: 'company logo',
      downloadAction: () => handleDownload('Logo Kit'),
    },
    {
      name: 'Color Palette',
      description: 'Definitive primary, secondary, and accent colors with HEX, RGB, and HSL values.',
      icon: Palette,
      imagePlaceholder: 'https://placehold.co/300x200.png',
      aiHint: 'color palette',
      downloadAction: () => handleDownload('Color Palette Guide'),
    },
    {
      name: 'Mood Board',
      description: 'A visual collection of images, textures, and typography to define your brand\'s feel.',
      icon: Layers,
      imagePlaceholder: 'https://placehold.co/300x200.png',
      aiHint: 'mood board',
      downloadAction: () => handleDownload('Mood Board'),
    },
     {
      name: 'Typography Guidelines',
      description: 'Specified fonts for headlines, body text, and captions, with usage examples.',
      icon: Layers, // Using Layers, consider Type icon if available or more suitable
      imagePlaceholder: 'https://placehold.co/300x200.png',
      aiHint: 'typography design',
      downloadAction: () => handleDownload('Typography Guide'),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Package className="mr-2 h-6 w-6 text-primary" />
            Your Branding Kit
          </CardTitle>
          <CardDescription>
            Access and manage your essential branding assets. HeyTek AI can generate these based on your brand identity, and they will be organized in your Company Asset Organizer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {brandingAssets.map((asset) => (
              <Card key={asset.name} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full h-48">
                  <Image
                    src={asset.imagePlaceholder}
                    alt={`${asset.name} placeholder`}
                    fill
                    className="object-cover"
                    data-ai-hint={asset.aiHint}
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <asset.icon className="mr-2 h-5 w-5 text-primary" />
                    {asset.name}
                  </CardTitle>
                  <CardDescription className="text-sm">{asset.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow"></CardContent> {/* Spacer */}
                <CardContent>
                   <Button onClick={asset.downloadAction} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Download className="mr-2 h-4 w-4" />
                    Download {asset.name} (Mock)
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-accent/30">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center text-accent">
            <MonitorPlay className="mr-2 h-6 w-6" />
            AI-Generated Brand Website (Conceptual)
          </CardTitle>
          <CardDescription>
            Leverage your branding assets to let HeyTek AI generate a foundational website for your company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Imagine a basic, professionally designed landing page, "About Us", and "Contact" page, all styled with your unique brand identity, generated automatically. This feature is currently conceptual.
          </p>
          <div className="relative w-full h-56 rounded-lg overflow-hidden bg-muted/50 border">
             <Image src="https://placehold.co/600x300.png" alt="Website preview placeholder" layout="fill" objectFit="cover" data-ai-hint="website design preview"/>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateWebsite} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            Generate My Website Preview (AI - Mock)
          </Button>
        </CardFooter>
      </Card>

       <Card className="mt-6 bg-secondary/50 border-secondary">
        <CardHeader>
          <CardTitle className="text-lg font-headline">What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Once your branding elements are finalized and organized, you can use them to build your MVP, marketing materials, and of course, your company website. Consistent branding builds trust and recognition!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
