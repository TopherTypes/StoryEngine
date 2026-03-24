import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.argv.includes('--watch');
const isProduction = !isDev;

// Ensure output directory exists
const outDir = path.join(__dirname, 'docs', 'assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Common esbuild options
const buildOptions = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: outDir,
  outbase: 'src',
  format: 'esm',
  sourcemap: isDev,
  minify: isProduction,
  target: ['es2020'],
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
  },
  loader: {
    '.png': 'file',
    '.svg': 'file',
    '.ttf': 'file',
    '.eot': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
};

async function build() {
  try {
    // Build CSS with PostCSS/Tailwind
    console.log('🎨 Building CSS with Tailwind...');
    execSync('npx postcss src/index.css -o ' + path.join(outDir, 'style.css'), {
      stdio: 'inherit',
    });

    if (isDev) {
      const context = await esbuild.context(buildOptions);
      console.log('📦 Building JS (watch mode)...');
      await context.watch();
      console.log('✅ Watch mode active. Press Ctrl+C to exit.');
    } else {
      console.log('📦 Building JS for production...');
      await esbuild.build(buildOptions);
      console.log('✅ Build complete!');
    }

    // Copy index.html and inject base tag for production
    const indexSrc = path.join(__dirname, 'index.html');
    const indexDest = path.join(__dirname, 'docs', 'index.html');

    let htmlContent = fs.readFileSync(indexSrc, 'utf-8');

    // Inject base tag for production deployment (GitHub Pages subdirectory)
    if (isProduction) {
      // Add base tag if not present
      if (!htmlContent.includes('<base ')) {
        htmlContent = htmlContent.replace(
          '<head>',
          '<head>\n    <base href="/storyengine/">'
        );
      }
    }

    // Add CSS link to head if not present
    if (!htmlContent.includes('href="./assets/style.css"')) {
      htmlContent = htmlContent.replace(
        '<title>StoryEngine - Authoring Tool</title>',
        '<title>StoryEngine - Authoring Tool</title>\n    <link rel="stylesheet" href="./assets/style.css">'
      );
    }

    // Update script reference to use the bundled output
    htmlContent = htmlContent.replace(
      '<script type="module" src="/src/main.tsx"><\/script>',
      '<script type="module" src="./assets/main.js"><\/script>'
    );

    fs.writeFileSync(indexDest, htmlContent, 'utf-8');
    console.log('📄 Updated index.html with CSS and JS references');

    // Copy favicon and any public assets
    const favicon = path.join(__dirname, 'vite.svg');
    const faviconDest = path.join(__dirname, 'docs', 'vite.svg');
    if (fs.existsSync(favicon)) {
      fs.copyFileSync(favicon, faviconDest);
      console.log('📄 Copied vite.svg');
    }

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();
