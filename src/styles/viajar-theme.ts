export const viajarTheme = {
  colors: {
    primary: {
      blue: 'hsl(var(--ms-primary-blue))',
      cyan: 'hsl(var(--ms-discovery-teal))',
      purple: 'hsl(var(--ms-guavira-purple))',
    },
    secondary: {
      yellow: 'hsl(var(--ms-secondary-yellow))',
      orange: 'hsl(var(--ms-cerrado-orange))',
      green: 'hsl(var(--ms-pantanal-green))',
    },
    neutral: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      muted: 'hsl(var(--muted))',
      mutedForeground: 'hsl(var(--muted-foreground))',
      border: 'hsl(var(--border))',
    }
  },
  
  spacing: {
    section: 'space-y-6',
    card: 'p-6',
    container: 'container mx-auto p-6',
  },
  
  typography: {
    h1: 'text-3xl font-bold text-foreground',
    h2: 'text-2xl font-semibold text-foreground',
    h3: 'text-xl font-semibold text-foreground',
    body: 'text-base text-foreground',
    muted: 'text-sm text-muted-foreground',
  },
  
  effects: {
    card: 'rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow',
    gradient: 'bg-gradient-to-br from-primary to-secondary',
    glassmorphism: 'bg-background/80 backdrop-blur-sm',
  }
} as const;
