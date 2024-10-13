# not251

[WIP] not251 - music theory library

## Table of Contents

- [Getting Started](#getting-started)
- [Structure](#structure)
- [Publishing](#publishing)

## Getting Started

1. Click the `Use this template` button on the top right of this page.
2. Clone your new repository:
   ```
   git clone https://github.com/your-username/your-repo.git
   ```
3. Install dependencies:
   ```
   pnpm install
   ```
4. Compile the code:
   ```
   pnpm build
   ```
5. Run tests:
   ```
   pnpm test
   ```
6. Initialize changesets:
   ```
   pnpm changesets init
   ```

## Structure

This is a [turborepo monorepo](https://turbo.build/repo/docs) template with the following structure:

```
├── apps
│   └── maxmsp-test
└── packages
    └── not251-ts
```

- `my-library`: Contains not251 typescript library code.
- `maxmsp-test`: Contains an instance of [this template](https://github.com/aptrn/maxmsp-ts-example) with `my-library` as a dependency.

## Publishing

This template uses [changesets](https://github.com/changesets/changesets) to manage versioning and changelogs, and GitHub Actions to publish new versions.

To create a new changeset:

1. Run `pnpm changeset`
2. Follow the prompts

When you're ready to publish to [npm](https://www.npmjs.com/) you can do it manually or with the GitHub Action.

### Manual

To publish manually:

1. Login to npm with `npm login`
2. Run `pnpm publish`
3. Follow the prompts

### GitHub Action

To publish with the GitHub Action:

1. Set up a [Repository Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) named `NPM_TOKEN` with your [npm token](https://docs.npmjs.com/creating-and-viewing-access-tokens).
2. The publish workflow will run automatically when you push to the `main` branch with a changeset.
3. The GitHub Action will create a new Pull Request with the new version and changelog.
4. When you merge that Pull Request, the new version will be published to npm and released on GitHub.
