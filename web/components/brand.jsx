export default function Brand({ light = false, small = false }) {
  return (
    <a
      href="/"
      className={`brand-lockup ${light ? "light" : ""} ${small ? "small" : ""}`}
      aria-label="Samuel Finance Limited home"
    >
      <span className="brand-symbol">
        <img src="/assets/logo.png" alt="" />
      </span>
      <span className="brand-words">
        SAMUEL<span>FINANCE LIMITED</span>
      </span>
    </a>
  );
}
