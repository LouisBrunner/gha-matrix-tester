package main

import (
	"flag"
	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"

	"github.com/LouisBrunner/esbuild-plugins/pkg/postcss"
	"github.com/evanw/esbuild/pkg/api"
)

func main() {
	var isDev, watch bool
	devPort := uint(4242)
	outputDir := "dist"
	publicDir := "public"
	inputTSFile := "src/index.tsx"
	flag.BoolVar(&isDev, "dev", false, "development mode")
	flag.BoolVar(&watch, "watch", false, "watch mode")
	flag.UintVar(&devPort, "port", devPort, "development port")
	flag.StringVar(&outputDir, "output", outputDir, "output directory")
	flag.StringVar(&publicDir, "public", publicDir, "public directory")
	flag.StringVar(&inputTSFile, "ts", inputTSFile, "input TypeScript file")
	flag.Parse()

	opts := api.BuildOptions{
		EntryPoints: []string{inputTSFile},
		Outdir:      outputDir,
		Bundle:      true,
		Plugins:     []api.Plugin{postcss.Plugin},
		Engines: []api.Engine{
			{Name: api.EngineChrome, Version: "58"},
			{Name: api.EngineFirefox, Version: "57"},
			{Name: api.EngineSafari, Version: "11"},
			{Name: api.EngineEdge, Version: "18"},
		},
		Write: true,
	}

	defines := map[string]string{
		"process.env.WATCH_MODE": "true",
	}
	if isDev {
		defines["process.env.ENV"] = "\"development\""
		opts.Sourcemap = api.SourceMapInline
	} else {
		defines["process.env.ENV"] = "\"production\""
		opts.MinifyWhitespace = true
		opts.MinifyIdentifiers = true
		opts.MinifySyntax = true
		opts.Outdir = outputDir
	}
	opts.Define = defines

	if watch {
		opts.Outdir = publicDir

		log.Printf("Watching\n")

		ctx, errCtx := api.Context(opts)
		if errCtx != nil {
			log.Fatal(errCtx)
		}

		err := ctx.Watch(api.WatchOptions{})
		if err != nil {
			log.Fatal(err)
		}

		_, err = ctx.Serve(api.ServeOptions{
			Host:     "localhost",
			Port:     uint16(devPort),
			Servedir: publicDir,
		})
		if err != nil {
			log.Fatal(err)
		}

		log.Printf("Listening on http://localhost:%d", devPort)
		<-make(chan struct{})
		ctx.Dispose()

	} else {
		log.Printf("Building\n")

		log.Printf("> Removing %s\n", opts.Outdir)
		err := os.RemoveAll(opts.Outdir)
		if err != nil {
			log.Fatal(err)
		}

		log.Printf("> Copying %s to %s\n", publicDir, opts.Outdir)
		err = recursiveCopy("public", opts.Outdir)
		if err != nil {
			log.Fatal(err)
		}

		log.Printf("> Building...\n")
		result := api.Build(opts)
		if len(result.Errors) > 0 {
			log.Fatal(result.Errors)
		}

		log.Printf("> Done\n")
	}
}

func recursiveCopy(src, dst string) error {
	return fs.WalkDir(os.DirFS(src), ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		srcPath := filepath.Join(src, path)
		dstPath := filepath.Join(dst, path)

		if d.IsDir() {
			return os.MkdirAll(dstPath, 0755)
		}

		srcFile, err := os.Open(srcPath)
		if err != nil {
			return err
		}
		defer srcFile.Close()
		dstFile, err := os.Create(dstPath)
		if err != nil {
			return err
		}
		defer dstFile.Close()
		_, err = io.Copy(dstFile, srcFile)
		return err
	})
}
