# Note

These are source assets from which CSS background data uris for table cell rendering dynamic CSS assets are constructed.

For example;

hot-cell-is-checked.svg
```
&.is-checked::after {
    background: theme.$primary-light url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:white' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E") no-repeat center center;
    background-size: 14px 14px;
    border-color: theme.$primary-light;
}
```

When editing the files, remember to (manually) commit changes to CSS files and replace any invalid characters in data URL (HTML URI encoding);

```
  '<' -> '%3C'
  '>' -> '%3E'
  '#' -> '%23'
```
