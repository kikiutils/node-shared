# TODO

## Path API

- [ ] Change `Path.toNamespacedPath()` to return a new `Path` instead of a `string` in a future breaking release.
    - Keep the original instance unchanged and preserve Node.js namespace-conversion behavior.
    - Allow file operations and other path methods to be called on the converted instance.
    - Verify that constructing the result preserves Windows drive and UNC namespace prefixes.
    - Update JSDoc, return-type tests, and runtime tests for Windows and POSIX behavior.
    - Document migration from the current string result to `.value` or `.toString()`.

Until this change is implemented, JSDoc must describe the current `string` return value.

## URL helpers

- [ ] Fix `appendRedirectParamToUrl` fragment handling when the target already has a query.
    - Input: `appendRedirectParamToUrl('/login?foo=bar#section', '/dashboard')`.
    - Expected: `/login?foo=bar&redirect=%2Fdashboard#section`.
    - Current result: `/login?foo=bar%23section&redirect=%2Fdashboard`.
    - Split the fragment before parsing the query and enable the corresponding pending unit test.
