import { Gallery } from "@/components/Gallery";
import { galleryPhotos } from "@/lib/cloudinary";

export const metadata = {
  title: "Gallery",
  description:
    "See the wonderful adventures and magical moments at The Clubhouse. From farm animals to forest fun!",
};

export default function GalleryPage() {
  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sage/30 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-bark sm:text-5xl">
              Gallery
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-stone sm:text-xl">
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
          <div className="rounded-2xl bg-gradient-to-r from-meadow to-forest p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Want to See More?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-lg text-sage">
              Follow us on social media for daily updates, or book a visit to
              see the Clubhouse in person. Your children could be making these
              memories too!
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/clubs"
                className="inline-block rounded-lg bg-sunshine px-8 py-3 font-display text-lg font-semibold text-bark transition-colors hover:bg-amber focus:outline-none focus:ring-2 focus:ring-sunshine focus:ring-offset-2 focus:ring-offset-forest"
              >
                Book a Place
              </a>
              <a
                href="/contact"
                className="inline-block rounded-lg border-2 border-white px-8 py-3 font-display text-lg font-semibold text-white transition-colors hover:bg-white hover:text-forest focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-forest"
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
