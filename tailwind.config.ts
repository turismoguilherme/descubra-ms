
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
				// Nova identidade visual "Descubra MS" baseada na logo
				ms: {
					'primary-blue': 'hsl(var(--ms-primary-blue))',          // Azul rio principal
					'secondary-yellow': 'hsl(var(--ms-secondary-yellow))',   // Amarelo dourado
					'pantanal-green': 'hsl(var(--ms-pantanal-green))',      // Verde floresta
					'cerrado-orange': 'hsl(var(--ms-cerrado-orange))',      // Laranja cerrado
					'discovery-teal': 'hsl(var(--ms-discovery-teal))',      // Azul-verde descoberta
					'earth-brown': 'hsl(var(--ms-earth-brown))',            // Tons terrosos
					'sky-blue': 'hsl(var(--ms-sky-blue))',                  // Azul céu
					'nature-green-light': 'hsl(var(--ms-nature-green-light))' // Verde claro
				},
				// FlowTrip Corporate Design System - Elegante e Profissional
				flowtrip: {
					'navy-primary': 'hsl(var(--flowtrip-navy-primary))',        // Navy profundo
					'navy-light': 'hsl(var(--flowtrip-navy-light))',            // Navy médio
					'orange-vibrant': 'hsl(var(--flowtrip-orange-vibrant))',    // Laranja vibrante
					'orange-light': 'hsl(var(--flowtrip-orange-light))',        // Laranja claro
					'teal-elegant': 'hsl(var(--flowtrip-teal-elegant))',        // Teal elegante
					'teal-light': 'hsl(var(--flowtrip-teal-light))',            // Teal claro
					'gray-100': 'hsl(var(--flowtrip-gray-100))',
					'gray-200': 'hsl(var(--flowtrip-gray-200))',
					'gray-300': 'hsl(var(--flowtrip-gray-300))',
					'gray-500': 'hsl(var(--flowtrip-gray-500))',
					'gray-700': 'hsl(var(--flowtrip-gray-700))',
					'gray-900': 'hsl(var(--flowtrip-gray-900))',
					'white': 'hsl(var(--flowtrip-white))',
					'bg-primary': 'hsl(var(--flowtrip-bg-primary))',
					'bg-secondary': 'hsl(var(--flowtrip-bg-secondary))',
					'text-primary': 'hsl(var(--flowtrip-text-primary))',
					'text-secondary': 'hsl(var(--flowtrip-text-secondary))',
					'text-tertiary': 'hsl(var(--flowtrip-text-tertiary))'
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
