This project explores rewriting the blog at https://github.com/mighdoll/mighdoll-site in Origami.

One thesis of the Origami project is that the web is missing an accepted convention for representing async trees: hierarchical structures whose values may take some time to compute. Without such a convention, constructing digital artifacts like blogs is complex enough that most people don't want to do it from scratch.

Among other things, this leads to an ecosystem of hundreds of static site generators (SSGs), all of which handle the same basic task of generating a folder of website resources in different ways. This places a substantial learning curve on anyone trying to adopt a new SSG. It also means that code written for one SSG is generally entangled with that SSG's idiosyncrasies and so cannot be immediately reused in the context of another.

## Data representation

One interesting choice in the project is to keep all the top-level post data like titles and dates in a single place.

- The project uses slugs as unique post IDs.
- In the Astro version, this is data is entered into the astro-db "database", then pulled out by the blog post template.
- The Astro posts are markdown files with a `slug` property in front matter.
- In the Origami version, the top-level post data is a YAML file `posts.yaml`. It could be changed to a JSON file, JS file, or something else.
- The Origami posts are markdown files that use the slug in the filename.
- The Origami expression in `postData.ori` defines a pipeline — a chain of function calls — that converts the YAML data and markdown into a set of post objects. This pipeline reads the YAML file as plain JS objects, then looks up the corresponding markdown post and adds its text to the object. The pipeline converts the markdown to HTML, then puts the posts in reverse chronological order.
- The data that results from this pipeline is used three times: to generate the index page, to generate the pages in the `blog` area, and to generate the RSS feed.

## Notes

- The Astro template `Header.astro` is currently just HTML, so this is ported as a plain HTML file `header.html`.
- The utility `prettyDate.js` is just a JavaScript function that can be invoked directly by the `post.ori` template.
- Astro templates appear to use JSX. One side effect of this is that HTML tags like `link` tags show up as `<link/>` (with a trailing slash). The Origami templates just use regular HTML, where `link` tags are self-closing: `<link>`.
- Astro does something with stylesheets that I can't understand, using `import` statements that somehow generate files like `_slug_.DvgHcWUj.css`. The Origami version just uses `link` tags.
