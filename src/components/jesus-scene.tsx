const WIDTHS = [640, 960, 1280, 1600, 1952] as const;

function srcSet(ext: "avif" | "webp") {
  return WIDTHS.map((width) => `/art/jesus-${width}.${ext} ${width}w`).join(", ");
}

function ArtPicture({
  className,
  alt,
  priority = false,
}: {
  className: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <picture className="art-shift">
      <source type="image/avif" srcSet={srcSet("avif")} sizes="100vw" />
      <source type="image/webp" srcSet={srcSet("webp")} sizes="100vw" />
      <img
        src="/art/jesus-1600.webp"
        alt={alt}
        width={1952}
        height={2176}
        className={className}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
      />
    </picture>
  );
}

/** Portrait scaled so both hands fit, with a little glow left above his hair. */
export function JesusScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <div className="art-frame">
        <ArtPicture
          priority
          alt="Jesus with arms open, light shining through the clouds."
          className="art-photo"
        />
      </div>
    </div>
  );
}
