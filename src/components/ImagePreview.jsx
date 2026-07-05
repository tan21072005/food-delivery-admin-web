export function ImagePreview({ src, className }) {
  if (!src) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`rounded-md border border-white/10 bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url("${src}")` }}
    />
  );
}
