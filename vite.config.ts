/** biome-ignore-all lint/style/noDefaultExport: that's vite mate */
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => ({
	plugins: [react(), tailwindcss()],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		port: 1820,
	},
}));
