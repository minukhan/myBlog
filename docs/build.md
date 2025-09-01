---
title: "Building your Blog"
---

Once you've set up your blog, let's see what it looks like locally:

```bash
npm run dev
```

This will start a local web server to run your blog on your computer. Open a web browser and visit `http://localhost:8080/` to view it.

> [!hint] Available commands
> You can use the following npm scripts:
>
> - `npm run build`: Build the static site
> - `npm run serve`: Build and serve the site
> - `npm run dev`: Build and serve with hot-reloading for development
>
> For more advanced options, you can run the build command directly:
>
> - `-d` or `--directory`: the content folder. This is normally just `content`
> - `-v` or `--verbose`: print out extra logging information
> - `-o` or `--output`: the output folder. This is normally just `public`
> - `--serve`: run a local hot-reloading server to preview your blog
> - `--port`: what port to run the local preview server on
> - `--concurrency`: how many threads to use to parse notes

> [!warning] Not to be used for production
> Serve mode is intended for local previews only.
> For production workloads, see the page on [[hosting]].
