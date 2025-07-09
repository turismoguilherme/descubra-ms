import React, { useEffect } from "react";

interface SecurityHeadersProps {
  children: React.ReactNode;
  enableStrictCSP?: boolean;
  enableHSTS?: boolean;
  enableFrameProtection?: boolean;
  enableContentTypeProtection?: boolean;
  enableReferrerPolicy?: boolean;
}

export const SecurityHeaders: React.FC<SecurityHeadersProps> = ({
  children,
  enableStrictCSP = true,
  enableHSTS = true,
  enableFrameProtection = true,
  enableContentTypeProtection = true,
  enableReferrerPolicy = true
}) => {
  // Content Security Policy
  const getCSPDirectives = () => {
    if (!enableStrictCSP) return "";
    
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://api.supabase.io https://*.supabase.co wss://*.supabase.co",
      "media-src 'self' data: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ];
    
    return directives.join('; ');
  };

  // Security headers configuration
  const securityHeaders = {
    // Content Security Policy
    ...(enableStrictCSP && {
      "Content-Security-Policy": getCSPDirectives()
    }),
    
    // HTTP Strict Transport Security
    ...(enableHSTS && {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
    }),
    
    // Frame Protection
    ...(enableFrameProtection && {
      "X-Frame-Options": "DENY"
    }),
    
    // Content Type Protection
    ...(enableContentTypeProtection && {
      "X-Content-Type-Options": "nosniff"
    }),
    
    // Referrer Policy
    ...(enableReferrerPolicy && {
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }),
    
    // Additional security headers
    "X-XSS-Protection": "1; mode=block",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
  };

  // Set headers using meta tags (for client-side)
  useEffect(() => {
    // Set security-related meta tags
    const metaTags = [
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { "http-equiv": "X-XSS-Protection", content: "1; mode=block" },
      { "http-equiv": "X-Content-Type-Options", content: "nosniff" },
      { "http-equiv": "X-Frame-Options", content: "DENY" }
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      if (tag.name) meta.setAttribute('name', tag.name);
      if (tag['http-equiv']) meta.setAttribute('http-equiv', tag['http-equiv']);
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });

    // Cleanup function to remove meta tags
    return () => {
      metaTags.forEach(tag => {
        const selector = tag.name 
          ? `meta[name="${tag.name}"]`
          : `meta[http-equiv="${tag['http-equiv']}"]`;
        const meta = document.querySelector(selector);
        if (meta) {
          document.head.removeChild(meta);
        }
      });
    };
  }, []);

  // Additional security measures
  useEffect(() => {
    // Disable right-click context menu (optional security measure)
    const handleContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    // Disable F12 and other developer tools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV === 'production') {
        // Disable F12
        if (e.key === 'F12') {
          e.preventDefault();
        }
        // Disable Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
        }
        // Disable Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
          e.preventDefault();
        }
        // Disable Ctrl+U
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
        }
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <>{children}</>;
};

export default SecurityHeaders;