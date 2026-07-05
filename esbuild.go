package main

import (
	"github.com/LouisBrunner/esbuild-plugins/pkg/devserver"
	"github.com/LouisBrunner/esbuild-plugins/pkg/postcss"
	"github.com/evanw/esbuild/pkg/api"
)

func main() {
	devserver.Run(devserver.Options{
		Port:        4242,
		OpenBrowser: true,
		Build: api.BuildOptions{
			EntryPoints: []string{"src/index.tsx"},
			Bundle:      true,
			Plugins: []api.Plugin{postcss.Must(postcss.NewPlugin(postcss.Options{
				Command: "bunx postcss",
				Filter:  `\.(s?css|sass)$`,
			}))},
			Engines: []api.Engine{
				{Name: api.EngineChrome, Version: "58"},
				{Name: api.EngineFirefox, Version: "57"},
				{Name: api.EngineSafari, Version: "14.1"},
				{Name: api.EngineEdge, Version: "18"},
			},
		},
		Output:    "dist",
		PublicDir: "public",
	})
}
