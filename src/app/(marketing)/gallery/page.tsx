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

      {/* CTA Section */}
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
              Want to See More?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-lg text-white/90">
              Follow us on social media for daily updates, or book a visit to
              see the Clubhouse in person. Your children could be making these
              memories too!
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/clubs"
                className="inline-block rounded-lg px-8 py-3 text-lg font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: "var(--craigies-burnt-orange)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Book a Place
              </a>
              <a
                href="/contact"
                className="cta-button-secondary inline-block rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Arrange a Visit
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
