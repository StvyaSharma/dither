# Image Dithering Application

This is an Image Dithering application built with [Next.js](https://nextjs.org) and TypeScript. The application allows users to upload images and apply various dithering algorithms to them.

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying [`src/app/page.tsx`](src/app/page.tsx). The page auto-updates as you edit the file.

## Project Structure

```
[.eslintrc.json]
.gitignore
[components.json]
[next.config.mjs]
[package.json]
[pnpm-lock.yaml]
[postcss.config.mjs]
[README.md]
[sample.py]
src/
  app/
    fonts/
      ...
    globals.css
    [layout.tsx]
    [page.tsx]
  components/
    [DitherControls.tsx]
    ui/
  lib/
    utils.ts
  strategies/
    AdditiveNoiseDithering.ts
    AMHalftoning.ts
    AtkinsonDithering.ts
    BayerMatrixDithering.ts
    [BurkesDithering.ts]
    CheckerboardDithering.ts
    ClusteredDotOrderedDithering.ts
    ...
  types/
    dithering.ts
[tailwind.config.ts]
[tsconfig.json]
```

## Dithering Strategies

The application supports various dithering strategies, which are defined in the [`src/strategies`](src/strategies) directory. Each strategy implements the `DitheringAlgorithm` interface and is exported as a `DitheringStrategy`.

Example strategies include:

- Additive Noise Dithering
- AM Halftoning
- Atkinson Dithering
- Bayer Matrix Dithering
- Burkes Dithering
- Checkerboard Dithering
- Clustered Dot Ordered Dithering

## Components

### DitherControls

The [`DitherControls`](src/components/DitherControls.tsx) component renders the controls for adjusting the dithering algorithm's parameters. It uses a combination of sliders and checkboxes to allow users to modify the configuration.

### ImageDithering

The main component of the application is [`ImageDithering`](src/app/page.tsx). It handles image upload, dithering application, and exporting the dithered image.

## Configuration

The application uses Tailwind CSS for styling. The configuration can be found in [`tailwind.config.ts`](tailwind.config.ts) and the global styles are defined in [`src/app/globals.css`](src/app/globals.css).

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

This project is licensed under the MIT License.
