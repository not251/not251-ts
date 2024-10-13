# MaxMsp TypeScript Library Template

This is a template for building MaxMsp compatible TypeScript libraries.

## Getting Started

1. Click the `Use this template` button on the top right of this page

2. Clone your new repository:
   ```
   git clone https://github.com/your-username/your-repo.git
   ```
3. Install dependencies:
   ```
   pnpm install
   ```
4. Compile the code:
   - Run `pnpm build` for a one-time build
5. Run tests:
   ```
   pnpm test
   ```
6. Initialize changesets:
   ```
   pnpm changesets init
   ```

## Usage in MaxMsp

You can check [this template](https://github.com/aptrn/maxmsp-ts-example) to setup a MaxMsp project using typescript with dependencies.

## Publishing

This template uses [changesets](https://github.com/changesets/changesets) to manage versioning and changelogs and Github Actions to publish new versions.
To create a new changeset, run `pnpm changeset`and follow the prompts.

When you're ready to publish to [npm](https://www.npmjs.com/), setup a [Repository Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) named `NPM_TOKEN` with your [npm token](https://docs.npmjs.com/creating-and-viewing-access-tokens).

The publish workflow will run automatically when you push to the `main` branch with a changeset.

The Github Action will create a new Pull request with the new version and changelog.
When you merge that Pull request, the new version will be published to npm.
