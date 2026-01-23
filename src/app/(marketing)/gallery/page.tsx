import { Gallery } from "@/components/Gallery";
import { galleryPhotos } from "@/lib/cloudinary";

export const metadata = {
  title: "Gallery",
  description:
    "See the wonderful adventures and magical moments at The Clubhouse. From farm animals to forest fun!",
};

export default function GalleryPage() {
  return (
    <div style={{ backgroundColor: "var(--craigies-cream)" }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-16 sm:py-24"
        style={{ backgroundColor: "var(--craigies-olive)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "white",
              }}
            >
              Gallery
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-white/90 sm:text-xl">
              Take a peek at the wonderful adventures and magical moments that
              happen every day at The Clubhouse. From farm animals to
              forest fun, see what your children could be enjoying!
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid with Lightbox */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Gallery photos={galleryPhotos} />
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl p-8 text-center sm:p-12"
            style={{ backgroundColor: "var(--craigies-olive)" }}
          >
            <h2
              className="text-3xl font-bold text-white sm:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sign Up for Our Newsletter
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-lg text-white/90">
              Stay updated with our latest activities, holiday club dates, and farm news. Join our mailing list today!
            </p>
            <form className="mx-auto mt-8 max-w-md">
              <label htmlFor="gallery-newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  id="gallery-newsletter-email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-lg border px-5 py-3 font-body text-white placeholder:text-white/50 focus:outline-none focus:ring-2 bg-white/10 focus:ring-white"
                  style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
                />
                <button
                  type="submit"
                  className="rounded-lg px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap"
                  style={{
                    backgroundColor: "var(--craigies-burnt-orange)",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
