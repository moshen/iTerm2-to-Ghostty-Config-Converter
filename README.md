# iTerm2 to Ghostty Config Converter

This is a browser based iTerm2 to Ghostty configuration converter.

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

To build and serve:

```shell
./scripts/gmake.exe serve
```

The typical development loop is to run `serve` in one terminal while rebuilding
various targets with something like:
`./scripts/gmake.exe clean-index dist/index.html` in another.

## Running locally

If you don't feel comfortable dropping your configs into a webpage, you can run
this locally in a couple of commands.
