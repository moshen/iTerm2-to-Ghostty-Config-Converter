# iTerm2 to Ghostty Config Converter

This is a browser based [iTerm2](https://iterm2.com/) to
[Ghostty](https://ghostty.org/) configuration converter.

[Click here to use converter on Github
pages](https://moshen.github.io/iTerm2-to-Ghostty-Config-Converter/)

## Why

Maybe you want to try Ghostty?

## Development

To build locally we require:

- `autoconf`
- `emscripten`

Which if you're on a Mac you can install with Homebrew:

```shell
brew install autoconf emscripten
```

If you're using `mise` on mac you can install `emscripten` with that:

```shell
mise install
```

To build and serve:

```shell
make serve
```

The typical development loop is to run `serve` in one terminal while rebuilding
various targets with something like:
`make clean-index dist/index.html` in another.

### Formatting / Linting

To format / lint, use `biome`:

```shell
npm ci
make lint fmt
```

## Running locally without building

If you don't feel comfortable dropping your configs into a webpage, you can run
this locally in a couple of commands.

First, clone this repository. Then:

```shell
git branch gh-pages origin/gh-pages
git worktree add gh-pages
scripts/redbean.exe -l 127.0.0.1 -p 8080 -w / -D gh-pages
```

Then you should be serving the build site locally on port `8080`.
[`redbean.exe`](https://redbean.dev/)
should work in Mac, Linux or Windows.

Any other tool could be used to serve the folder locally. Python for instance:

```shell
git checkout gh-pages
python3 -m http.server 8080 --bind 127.0.0.1
```
