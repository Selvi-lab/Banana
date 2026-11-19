// A template re-mounts on every navigation, so each page gets a fresh
// entrance animation. Only opacity is animated: transforms here would
// create a containing block for any fixed-position descendants.
export default function Template({ children }) {
  return <div className="page-enter">{children}</div>;
}
