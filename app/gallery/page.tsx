"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

type ImageItem = {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
};

export default function GalleryPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<ImageItem | null>(null);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // UI-only: image loading skeletons
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  /* ================= LOAD IMAGES ================= */

  const loadImages = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);

    try {
      const url = cursor
        ? `/api/gallery?cursor=${encodeURIComponent(cursor)}`
        : `/api/gallery`;

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load gallery");
      }

      const data = await res.json();

      const newImages: ImageItem[] = data.images ?? [];

      setImages((prev) => [...prev, ...newImages]);
      setCursor(data.nextCursor ?? null);
      setHasMore(Boolean(data.nextCursor));
    } catch (err) {
      console.error("Failed to load gallery", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loadingMore]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  /* ================= ACTIONS ================= */

  const handleDelete = async () => {
    if (!selected) return;

    // UI-only: confirm (keeps logic unchanged)
    const ok = confirm("Delete this image? This action can’t be undone.");
    if (!ok) return;

    const res = await fetch(`/api/image/${selected.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== selected.id));
      setSelected(null);
    } else {
      alert("Failed to delete image");
    }
  };

  const handleDownload = async () => {
    if (!selected) return;

    const res = await fetch(selected.imageUrl);
    const blob = await res.blob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `image-${selected.id}.png`;

    document.body.appendChild(a);
    a.click();

    a.remove();
    URL.revokeObjectURL(url);
  };

  /* ================= DERIVED UI ================= */

  const title = useMemo(() => {
    const count = images.length;
    return count === 1 ? "Your gallery (1 image)" : `Your gallery (${count} images)`;
  }, [images.length]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="h-8 w-56 rounded-xl bg-white/10 animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]"
              >
                <div className="aspect-square bg-white/10 animate-pulse" />
                <div className="p-3">
                  <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-white/10 rounded mt-2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm text-white/50 mt-6">Loading gallery…</div>
        </div>
      </div>
    );
  }

  if (!loading && images.length === 0) {
    return (
      <div className="min-h-[70vh] bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-2xl font-semibold">Your gallery is empty</div>
            <div className="mt-2 text-white/60">
              You haven’t generated any images yet. Create one — it will appear here.
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-black text-white">
      {/* soft premium background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(700px_450px_at_80%_20%,rgba(236,72,153,0.14),transparent_60%),radial-gradient(650px_450px_at_50%_85%,rgba(34,197,94,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/80" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* header */}
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-white/60">
            Click any image to preview, download, or delete it.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => {
            const isLoaded = Boolean(loaded[img.id]);

            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelected(img)}
                className="group text-left rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {/* image */}
                <div className="relative aspect-square overflow-hidden">
                  {/* skeleton shimmer */}
                  <div
                    className={[
                      "absolute inset-0",
                      isLoaded ? "opacity-0" : "opacity-100",
                      "transition-opacity",
                      "bg-gradient-to-br from-white/10 via-white/5 to-white/10",
                      "animate-pulse",
                    ].join(" ")}
                  />
                  <img
                    src={img.imageUrl}
                    alt={img.prompt}
                    className={[
                      "absolute inset-0 w-full h-full object-cover",
                      "transition duration-300",
                      "group-hover:scale-[1.03]",
                      loaded[img.id] === false ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                    onLoad={() =>
                      setLoaded((p) => ({
                        ...p,
                        [img.id]: true,
                      }))
                    }
                    onError={() =>
                      setLoaded((p) => ({
                        ...p,
                        [img.id]: false,
                      }))
                    }
                    loading="lazy"
                  />
                  {loaded[img.id] === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black text-white/50 text-xs">
                      Corrupted image
                    </div>
                  )}
                  {/* subtle top gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-80" />

                  {/* hover overlay with prompt */}
                  <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition">
                    <div className="w-full p-3">
                      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-2">
                        <p className="text-xs text-white/90 line-clamp-2">
                          {img.prompt}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* meta */}
                <div className="p-3">
                  <div className="text-xs text-white/70 line-clamp-1">
                    {img.prompt}
                  </div>
                  <div className="text-[11px] text-white/45 mt-1">
                    {new Date(img.createdAt).toLocaleString()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* LOAD MORE */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadImages}
              disabled={loadingMore}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-sm transition disabled:opacity-50 disabled:hover:bg-white/[0.04]"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          {/* overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative max-w-4xl w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* top bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
              <div className="min-w-0">
                <div className="text-sm text-white/90 line-clamp-1">{selected.prompt}</div>
                <div className="text-[11px] text-white/50 mt-0.5">
                  {new Date(selected.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-sm transition"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            {/* image */}
            <div className="bg-black">
              <img
                src={selected.imageUrl}
                alt={selected.prompt}
                className="w-full max-h-[72vh] object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="hidden text-center text-white/50 py-20">
                Failed to load image
              </div>
            </div>

            {/* actions */}
            <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-white/60">
                Tip: right-click also works for saving, but Download is safer.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.10] text-sm transition"
                >
                  Download
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 text-sm transition text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
