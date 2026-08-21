/** biome-ignore-all lint/style/noDefaultExport: that's vite mate */
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import csp from "vite-plugin-csp-guard";
import sri from "vite-plugin-sri-gen";

export default defineConfig(() => ({
	plugins: [
		react(),
		tailwindcss(),
		csp({
			algorithm: "sha256",
			override: true,
			policy: {
				"base-uri": ["'none'"],
				"connect-src": ["'self'"],
				"default-src": ["'none'"],
				"form-action": ["'none'"],
				"img-src": ["'self'"],
				"object-src": ["'none'"],
				"script-src": ["'self'", "https://static.cloudflareinsights.com"],
				"style-src": ["'self'", "'unsafe-inline'"],
			},
		}),
		sri(),
	],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		port: 1820,
	},
}));
