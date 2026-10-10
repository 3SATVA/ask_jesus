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
    <picture className="block h-full w-full">
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

/** Full-bleed cover of the supplied portrait, with the figure kept whole on tall screens. */
export function JesusScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#16324a]">
      <div className="absolute inset-0">
        <ArtPicture
          alt=""
          className="h-full w-full scale-110 object-cover object-center blur-3xl"
        />
      </div>
      <div className="art-frame">
        <ArtPicture
          priority
          alt="Jesus with arms open, glowing in the clouds above the earth."
          className="art-photo h-full w-full"
        />
      </div>
    </div>
  );
}
