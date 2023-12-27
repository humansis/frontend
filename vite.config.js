import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
	],
	define: {
		__INTLIFY_JIT_COMPILATION__: true,
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			fs: fileURLToPath(new URL("./src/.junk/builtins_placeholder.txt", import.meta.url)),
			url: fileURLToPath(new URL("./src/.junk/builtins_placeholder.txt", import.meta.url)),
			path: fileURLToPath(new URL("./src/.junk/builtins_placeholder.txt", import.meta.url)),
			"source-map-js": fileURLToPath(new URL("./src/.junk/builtins_placeholder.txt", import.meta.url)),
		},
		extensions: [".js", ".vue"],
	},
	server: {
		port: 8080,
	},
});
