
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
				// FlowTrip Professional Government Colors
				flowtrip: {
					'navy-primary': 'hsl(var(--flowtrip-navy-primary))',      // #1a365d
					'gray-primary': 'hsl(var(--flowtrip-gray-primary))',      // #2d3748
					'blue-accent': 'hsl(var(--flowtrip-blue-accent))',        // #3182ce
					'white': 'hsl(var(--flowtrip-white))',                    // #ffffff
					'gray-light': 'hsl(var(--flowtrip-gray-light))',          // #f7fafc
					'text-primary': 'hsl(var(--flowtrip-text-primary))',      // #2d3748
					'text-secondary': 'hsl(var(--flowtrip-text-secondary))',  // #4a5568
					'border': 'hsl(var(--flowtrip-border))'                   // #e2e8f0
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Roboto', 'sans-serif'],
			},
			fontSize: {
				'xs': 'var(--flowtrip-text-xs)',
				'sm': 'var(--flowtrip-text-sm)',
				'base': 'var(--flowtrip-text-base)',
				'lg': 'var(--flowtrip-text-lg)',
				'xl': 'var(--flowtrip-text-xl)',
				'2xl': 'var(--flowtrip-text-2xl)',
				'3xl': 'var(--flowtrip-text-3xl)',
				'4xl': 'var(--flowtrip-text-4xl)',
				'5xl': 'var(--flowtrip-text-5xl)',
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
