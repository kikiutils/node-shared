# TODO

## Path API

- [ ] Change `Path.toNamespacedPath()` to return a new `Path` instead of a `string` in a future breaking release.
    - Keep the original instance unchanged and preserve Node.js namespace-conversion behavior.
    - Allow file operations and other path methods to be called on the converted instance.
    - Verify that constructing the result preserves Windows drive and UNC namespace prefixes.
    - Update JSDoc, return-type tests, and runtime tests for Windows and POSIX behavior.
    - Document migration from the current string result to `.value` or `.toString()`.

Until this change is implemented, JSDoc must describe the current `string` return value.
