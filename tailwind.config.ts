import type { Config } from 'tailwindcss'

const {
	default: flattenColorPalette
} = require('tailwindcss/lib/util/flattenColorPalette')
const config: Config = {
	darkMode: ['class', 'class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}'
	],
	theme: {
    	extend: {
    		animation: {
    			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
    			grid: 'grid 15s linear infinite'
    		},
    		keyframes: {
    			'border-beam': {
    				'100%': {
    					'offset-distance': '100%'
    				}
    			},
    			grid: {
    				'0%': {
    					transform: 'translateY(-50%)'
    				},
    				'100%': {
    					transform: 'translateY(0)'
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
    			border: 'rgb(52,52,52)'
    		},
    		borderColor: {
    			DEFAULT: 'rgb(52,52,52)'
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
