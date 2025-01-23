/** @type {import('next').NextConfig} */
const nextConfig = {
	// output: "export",
	swcMinify: false,
	typescript: {
		ignoreBuildErrors: true
	},
	eslint: {
		ignoreDuringBuilds: true
	},
	images: {
		domains: ['aceternity.com']
	}
}

module.exports = nextConfig
