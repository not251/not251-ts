# not251

[WIP] not251 - music theory library

## Table of Contents

- [Getting Started](#getting-started)
- [Structure](#structure)
- [Publishing](#publishing)

## Getting Started

1. Clone this repository:
   ```
   git clone git@github.com:not251/not251-ts.git
   ```
2. Install dependencies:
   ```
   pnpm install
   ```
3. Compile the code:
   ```
   pnpm build
   ```
4. Run tests:
   ```
   pnpm test
   ```

## Structure

This is a [turborepo monorepo](https://turbo.build/repo/docs) template with the following structure:

```
├── apps
│   ├── maxmsp-test
│   └── web
└── packages
    └── not251
```

- `not251`: Contains not251 typescript library code.
- `maxmsp-test`: Contains an instance of [this template](https://github.com/aptrn/maxmsp-ts-example) with `not251` as a dependency.
- `web`: Contains a svelte project as web demo for not251.
