
import type { Config } from "tailwindcss";

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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Poppins', 'sans-serif'],
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
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
