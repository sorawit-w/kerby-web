// Join the base path to an internal path with exactly one slash — survives the
// custom-domain migration (README runbook) where BASE_URL becomes "/", which
// would otherwise make `${base}/x` a protocol-relative `//x`. Use it for every
// internal link and asset; check:discipline rejects root-absolute URLs that
// escape a configured base.
export const url = (p: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
