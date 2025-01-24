import type { Config } from 'tailwindcss'

const {
	default: flattenColorPalette
} = require('tailwindcss/lib/util/flattenColorPalette')
const config: Config = {
	darkMode: 'class',
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}'
	],
	theme: {
		extend: {
			animation: {
				'border-beam':
					'border-beam calc(var(--duration)*1s) infinite linear'
			},
			keyframes: {
				'border-beam': {
					'100%': {
						'offset-distance': '100%'
					}
				}
			},
			colors: {
				background: 'rgb(96,92,112)',
				foreground: 'rgb(255,255,255)',
				primary: {
					DEFAULT: 'rgb(255,255,255)',
					foreground: 'rgb(15,15,15)'
				},
				border: 'rgb(52,52,52)' // Добавляем определение для border
			},
			borderColor: {
				DEFAULT: 'rgb(52,52,52)' // Добавляем определение цвета границы по умолчанию
			}
		}
	},
	plugins: [addVariablesForColors]
}
function addVariablesForColors({ addBase, theme }: any) {
	let allColors = flattenColorPalette(theme('colors'))
	let newVars = Object.fromEntries(
		Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
	)

	addBase({
		':root': newVars
	})
}
export default config
