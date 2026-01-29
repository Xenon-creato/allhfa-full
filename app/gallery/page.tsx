"use client";

import { useEffect, useState, useCallback } from "react";

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

  /* ================= LOAD IMAGES ================= */

  const loadImages = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);

    try {
      const url = cursor
        ? `/api/gallery?cursor=${cursor}`
        : `/api/gallery`;

        const res = await fetch(`/api/image/${selected.id}`, {
        method: "DELETE",
        credentials: "include",
        });


      if (res.status === 401) {
        // не валимо сторінку
        setHasMore(false);
        return;
      }

      const data = await res.json();

      setImages((prev) => [...prev, ...data.images]);
      setCursor(data.nextCursor);
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

    const res = await fetch(`/api/image/${selected.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setImages((prev) =>
        prev.filter((img) => img.id !== selected.id)
      );
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

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        Loading gallery...
      </div>
    );
  }

  if (!loading && images.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        You haven’t generated any images yet
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your gallery</h1>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => setSelected(img)}
            className="group relative rounded-xl overflow-hidden border cursor-pointer"
          >
            <img
              src={img.imageUrl}
              alt={img.prompt}
              className="w-full h-full object-cover"
            />

            {/* hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-end">
              <p className="text-xs text-white p-2 line-clamp-3">
                {img.prompt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadImages}
            disabled={loadingMore}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-3xl w-full bg-zinc-900 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.imageUrl}
              alt={selected.prompt}
              className="w-full max-h-[70vh] object-contain bg-black"
            />

            <div className="p-4 space-y-3">
              <p className="text-sm text-zinc-300">
                {selected.prompt}
              </p>

              <p className="text-xs text-zinc-500">
                {new Date(selected.createdAt).toLocaleString()}
              </p>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleDownload}
                  className="text-sm text-blue-400 hover:text-blue-500 transition"
                >
                  Download image
                </button>

                <button
                  onClick={handleDelete}
                  className="text-sm text-red-400 hover:text-red-500 transition"
                >
                  Delete image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
