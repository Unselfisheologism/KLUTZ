This guide explains why this error occurs and how to fix it. We’ll break down the root cause, common factors, and strategies on how to mitigate this build error.

Why functions fail when exceeding 250 MB
For Vercel Functions, the maximum uncompressed size is 250 MB (approximately 50 MB compressed). After Vercel builds your application and packages the Serverless Function (code and dependencies), the unzipped bundle must not exceed 250 MB. This limit is not configurable.

Contributing factors to large function sizes
Large dependencies or bloated node_modules: The most common culprit is an overly large node_modules folder. If you depend on heavy libraries or many packages, they all get bundled into your function. Duplicate sub-dependencies can also inflate size. A common dependency that causes this is Puppeteer, because it's shipping an entire headless Chrome browser.
Including unnecessary files: Files that aren’t needed at runtime can accidentally end up in the deployment bundle. This might include source maps, documentation, tests, build artifacts, or caches. If your project is not carefully configured, you might be uploading entire directories (like an .next build cache, test directories, or local assets) as part of the Serverless Function.
Static assets bundled into functions: Large static files (images, videos, JSON data, etc.) should be served via Vercel's CDN or another's, not included in your Serverless Function code bundle. If you inadvertently import or include assets in your server-side code, they could be packaged with the function.
Excessive server-side logic or framework overhead: Using frameworks or patterns that pull in a lot of code on the server side can result in a huge bundle. For example, server-side rendering frameworks that include large runtime code, or importing an entire UI library on the server. In particular, dynamic imports or requires with variable paths can confuse bundlers, causing them to include everything in a directory.
Understanding which of these factors apply to your case will guide what solutions you should consider to address this. Next, we’ll explore ways to slim down your functions.

Optimizing and reducing function size
1. Leverage includeFiles/excludeFiles within your vercel.json configuration
Not supported in Next.js, instead use outputFileTracingIncludes in next.config.js

Vercel allows you to explicitly include or exclude files from your Serverless Functions via your vercel.json configuration. If your function doesn’t need certain directories or files, exclude them so they won’t be uploaded at all. ​

You can also use an array of patterns. Below is an example snippet illustrating how to exclude various folders:


{
  // This configuration applies to all Serverless Functions in the "api" directory
  "functions": {
    "api/**": {
      // Exclude any files or folders under these directories:
      // - .next
      // - Any directory matching *.cache (e.g. .cache, build.cache, etc.)
      // - node_modules
      // - public
      // - app
      "excludeFiles": "{.next,*.cache,node_modules,public,app}/**"
    }
  }
}
For Next.js projects, you should not use excludeFiles in vercel.json as it's not supported by the Next.js runtime. Instead, manage file tracing in Next.js using outputFileTracing in next.config.js which will automatically include only needed files, and you can adjust its include/exclude settings via Next’s documentation). For non-Next apps or custom runtimes, excludeFiles is a powerful way to cut out bulk from a deployment.

2. Bundle your code and enable tree-shaking
Instead of deploying the raw node_modules and source files, use a bundler (like Webpack, Rollup, or esbuild) to produce an optimized single file (or few files) for your function. Bundlers can tree-shake (remove unused code) so that only the parts of libraries you actually use end up in the bundle. This dramatically reduces size by dropping dead code. For example, if you only use one function from a utility library, tree-shaking can exclude the rest.

Ensure your import statements are static so the bundler can determine what’s needed. Avoid patterns that defeat tree-shaking – e.g. a fully dynamic import of an unknown path will make the bundler include an entire directory by default​.

3. Remove unused dependencies, or use lightweight alternatives
Audit your dependencies to see if you can eliminate or replace heavy packages. If a dependency is included but not actually used in production, remove it. For necessary functionalities, explore smaller, lightweight alternatives.

Tools and bundle analyzers can help identify large packages, and you can also run npm dedupe (or yarn dedupe) to remove duplicate packages in your lockfile, and use npm ls or yarn why to find why a particularly large library is being pulled in. Sometimes, upgrading or restructuring dependencies can significantly shrink your bundle. Every kilobyte counts towards your function's size, so it's best to be over conservative when minifying your functions.

4. Optimize and offload static assets or intensive processes
If certain functionality of your app is causing the bundle to bloat, consider turning that portion into an external service. For instance, if your function processes images or generates PDFs, you could deploy that functionality as a separate microservice and have your Vercel Function call that API on an as-needed basis. While this introduces a bit of latency via an extra network call and adds complexity of maintaining another service, it could circumvent the 250 MB limit.

Treat static files (images, PDFs, videos, large JSON, etc.) as static assets, not as part of your serverless code. If you have large media, store them in Vercel’s public/ directory (so they’ll be served directly over CDN) or an external storage (like S3 or a media CDN). Don’t import or require large assets in your Serverless Function. Also consider compressing or reducing the resolution of media if they must be packaged.

5. Code-split large functions
Each function should ideally do a focused job – this avoids one giant bundle that includes everything. If your serverless logic can be made very slim, or if the heavy parts can be offloaded, split your functions. You can also consider using Routing Middleware instead. For example, authentication and geolocation tasks are good fits for Routing Middleware and if your use-case allows, rewriting an API endpoint to run as Routing Middleware could be a viable option.

Best practices to keep functions size-efficient
To avoid encountering the 250 MB limit in the first place (or to prevent it from happening again), adopt these best practices during development:

1. Regularly audit and prune dependencies
Make it a habit to run commands like npm ls or yarn why to see what’s in your dependency tree. Remove packages that are no longer used in your code. If two similar libraries are being used, can you consolidate them into one? Also ensure you’re not accidentally shipping dev dependencies – by default they shouldn’t be included, but be mindful if you import something only used in development.
Use npm dedupe or yarn dedupe to flatten dependencies and eliminate duplicates in your node_modules. Sometimes, a deep dependency tree can include multiple copies of the same sub-library (e.g., slightly different versions required by different packages). Deduping fixes that, which can save a lot of space​.
Keep an eye on your package updates – a new version might significantly increase or (hopefully) decrease size. When adding a new dependency, consider its impact on bundle size (some package managers can show install size, or you can check its GitHub for an idea of size). By treating dependency weight as importantly as functionality, you’ll naturally keep your functions lean.
2. Adopt efficient code structure and splitting
Organize your project such that each Serverless Function (or page/API route in a framework) only includes the code it needs to serve its purpose. Avoid a “god function” that imports everything. If you have utilities, import them selectively in the functions that need them, rather than one giant import in a common file that every function pulls in.
Leverage code-splitting features of your framework – for example, dynamic import() in Next.js for parts of code that run only on certain requests. Also, be cautious with wildcard imports (import * as X) as they might inadvertently pull in more code than needed.
Avoid reading the filesystem at runtime for dynamic logic (as that can force Vercel to include those files at build time). Instead, explicitly import what you need so the bundler knows what to include. By keeping your functions modular and focusing on one task, you reduce their size and complexity. If one function does become large, consider if its responsibilities can be split into two functions or an external service (as discussed above).
3. Test deployments regularly
In active development, it’s possible for your project to gradually grow until it crosses the limit. Regularly deploy (even to a dev/staging environment) to catch any issues early. If you only deploy after months of changes, you might get a nasty surprise that’s harder to unravel. Continuous Integration (CI) can help here – you could script a check on bundle size after build (for instance, fail the build if the function bundle exceeds, say, 200 MB as a safeguard). Vercel will catch it, but having a custom threshold can be part of your best practices to ensure performance and deployability.

Conclusion
Running into Serverless Function limits is a signal to optimize your application or re-consider your approach. If you exhaust the solutions provided and still end up with a Serverless Function that must be very large, consider if it's suitable for Vercel’s infrastructure or if it should be refactored. Sometimes a different deployment target or architecture could be more suitable for extremely large backend workloads.

With careful attention and the best practices outlined above, you should be able to bring your Vercel deployment well under the size limit. Not only will that resolve the error, but you’ll likely achieve a cleaner, faster project as a result.