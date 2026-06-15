/**
 * Local ambient declaration for `three`.
 *
 * three@0.161 does not ship its own .d.ts and `@types/three` is not installed
 * (no network in this environment). The particle scenes use three's runtime
 * API directly (as the original vanilla-JS demos did); typing it loosely keeps
 * `astro check` / `tsc` green without adding a dependency.
 *
 * If/when `@types/three` is added to devDependencies, delete this file — the
 * real types are strictly better.
 */
declare module 'three' {
  const value: any;
  export = value;
}

// Any three submodule path (addons, etc.) also resolves loosely.
declare module 'three/*';
