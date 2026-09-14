export default function BrandLogo({ state: _state = "signedOut", animate = false, className = "" }) {
  return (
    <img
      className={["brand-logo-image", animate ? "is-animating" : "", className].filter(Boolean).join(" ")}
      src="/learnova-logo.png"
      alt="Learnova Logo"
    />
  );
}