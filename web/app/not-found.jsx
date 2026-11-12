import Brand from "../components/brand";
export default function NotFound() {
  return (
    <main className="not-found">
      <Brand />
      <span className="eyebrow">PAGE NOT FOUND / 404</span>
      <h1>
        Let’s get you
        <br />
        <em>back on track.</em>
      </h1>
      <p>This page may have moved or is no longer published.</p>
      <a className="button forest" href="/">
        Return to the website ↗
      </a>
    </main>
  );
}
