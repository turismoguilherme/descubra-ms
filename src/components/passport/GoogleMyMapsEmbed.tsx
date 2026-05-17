import React from 'react';
import { normalizeGoogleMapsEmbedUrl } from '@/utils/googleMapsEmbed';
import { cn } from '@/lib/utils';

interface GoogleMyMapsEmbedProps {
  embedUrl: string;
  title?: string;
  className?: string;
}

const GoogleMyMapsEmbed: React.FC<GoogleMyMapsEmbedProps> = ({
  embedUrl,
  title = 'Mapa do roteiro',
  className,
}) => {
  const src = normalizeGoogleMapsEmbedUrl(embedUrl);
  if (!src) return null;

  return (
    <iframe
      title={title}
      src={src}
      className={cn('w-full rounded-xl border border-gray-200', className)}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
};

export default GoogleMyMapsEmbed;
