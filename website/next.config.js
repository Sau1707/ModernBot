/** @type {import('next').NextConfig} */

const env = process.env.NODE_ENV;

const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	basePath: env == 'development' ? null : '/Grepolis',
	images: {
		unoptimized: true,
	},
	webpack5: true,
	webpack: (config) => {
		config.resolve.fallback = {
			fs: false,
			path: false,
		};

		return config;
	},
};

module.exports = nextConfig;
