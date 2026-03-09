
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// ViaJARTur Brand
				viajar: {
					'slate': 'hsl(var(--viajar-slate))',
					'cyan': 'hsl(var(--viajar-cyan))',
					'cyan-light': 'hsl(var(--viajar-cyan-light))',
					'blue': 'hsl(var(--viajar-blue))',
					'emerald': 'hsl(var(--viajar-emerald))',
					'amber': 'hsl(var(--viajar-amber))'
				},
				// Descubra MS
				ms: {
					'primary-blue': 'hsl(var(--ms-primary-blue))',
					'secondary-yellow': 'hsl(var(--ms-secondary-yellow))',
					'pantanal-green': 'hsl(var(--ms-pantanal-green))',
					'cerrado-orange': 'hsl(var(--ms-cerrado-orange))',
					'discovery-teal': 'hsl(var(--ms-discovery-teal))',
					'earth-brown': 'hsl(var(--ms-earth-brown))',
					'sky-blue': 'hsl(var(--ms-sky-blue))',
					'nature-green-light': 'hsl(var(--ms-nature-green-light))',
					'guavira-purple': 'hsl(var(--ms-guavira-purple))',
					'rivers-blue': 'hsl(var(--ms-rivers-blue))',
					'accent-orange': 'hsl(var(--ms-accent-orange))'
				},
				// Travel Tech Premium 2025/2026
				'travel-tech': {
					'turquoise': 'hsl(var(--travel-tech-turquoise))',
					'ocean-blue': 'hsl(var(--travel-tech-ocean-blue))',
					'sunset-orange': 'hsl(var(--travel-tech-sunset-orange))',
					'dark-base': 'hsl(var(--travel-tech-dark-base))',
					'dark-secondary': 'hsl(var(--travel-tech-dark-secondary))',
					'neon-glow': 'hsl(var(--travel-tech-neon-glow))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Poppins', 'sans-serif'],
				playfair: ['Playfair Display', 'serif'],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				// Travel Tech Premium Animations
				'float-tech': {
					'0%, 100%': { 
						transform: 'translate3d(0, 0, 0) rotate(0deg)',
						opacity: '0.6' 
					},
					'33%': { 
						transform: 'translate3d(30px, -30px, 0) rotate(120deg)',
						opacity: '1' 
					},
					'66%': { 
						transform: 'translate3d(-20px, 20px, 0) rotate(240deg)',
						opacity: '0.8' 
					}
				},
				'data-flow': {
					'0%': { 
						transform: 'translateX(-100%)',
						opacity: '0' 
					},
					'50%': { 
						transform: 'translateX(0%)',
						opacity: '1' 
					},
					'100%': { 
						transform: 'translateX(100%)',
						opacity: '0' 
					}
				},
				'neon-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
						opacity: '1'
					},
					'50%': { 
						boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
						opacity: '0.8'
					}
				},
				'holographic-scan': {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { transform: 'translateY(100%)', opacity: '0' }
				},
				'rotate-globe': {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 3s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-ms': 'linear-gradient(to right, #003087, #2E7D32)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
