import {
  Bird,
  Flower2,
  Leaf,
  PawPrint,
  Palette,
  TreePine,
  Sun,
  Rabbit,
  Bug,
  Tent,
  Wheat,
  Egg,
  Carrot,
  Droplets,
  Mountain,
  Sparkles,
} from "lucide-react";

const galleryItems = [
  {
    icon: PawPrint,
    title: "Meeting the Goats",
    description: "Children love feeding and petting our friendly goats",
    category: "Farm Animals",
  },
  {
    icon: Rabbit,
    title: "Bunny Cuddles",
    description: "Gentle moments with our adorable rabbits",
    category: "Farm Animals",
  },
  {
    icon: Bird,
    title: "Chicken Care",
    description: "Learning to care for our feathered friends",
    category: "Farm Animals",
  },
  {
    icon: Egg,
    title: "Egg Collecting",
    description: "The excitement of finding fresh eggs each morning",
    category: "Farm Activities",
  },
  {
    icon: TreePine,
    title: "Den Building",
    description: "Creating secret hideaways in the woodland",
    category: "Outdoor Play",
  },
  {
    icon: Tent,
    title: "Campfire Stories",
    description: "Gathering around for songs and storytelling",
    category: "Outdoor Play",
  },
  {
    icon: Palette,
    title: "Nature Crafts",
    description: "Making art with leaves, sticks, and natural treasures",
    category: "Creative Activities",
  },
  {
    icon: Flower2,
    title: "Flower Pressing",
    description: "Preserving beautiful blooms from our meadow",
    category: "Creative Activities",
  },
  {
    icon: Carrot,
    title: "Veggie Patch",
    description: "Growing and harvesting our own vegetables",
    category: "Gardening",
  },
  {
    icon: Wheat,
    title: "Hay Bale Fun",
    description: "Jumping and playing in the hay barn",
    category: "Outdoor Play",
  },
  {
    icon: Bug,
    title: "Bug Hunting",
    description: "Discovering minibeasts in the garden",
    category: "Nature Exploration",
  },
  {
    icon: Droplets,
    title: "Pond Dipping",
    description: "Exploring aquatic life in our wildlife pond",
    category: "Nature Exploration",
  },
  {
    icon: Leaf,
    title: "Woodland Walks",
    description: "Adventures through our beautiful forest trails",
    category: "Nature Exploration",
  },
  {
    icon: Sun,
    title: "Outdoor Games",
    description: "Running, playing, and having fun in the fresh air",
    category: "Outdoor Play",
  },
  {
    icon: Mountain,
    title: "Hill Climbing",
    description: "Conquering our meadow hills and enjoying the views",
    category: "Outdoor Play",
  },
  {
    icon: Sparkles,
    title: "Seasonal Celebrations",
    description: "Special events and holiday-themed activities",
    category: "Special Events",
  },
];

export default function GalleryPage() {
  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sage/30 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-bark sm:text-5xl">
              Our Gallery
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-stone sm:text-xl">
              Take a peek at the wonderful adventures and magical moments that
              happen every day at Explore the Clubhouse. From farm animals to
              forest fun, see what your children could be enjoying!
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {galleryItems.map((item, index) => (
              <div
                key={index}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl bg-sage/20 shadow-[var(--shadow-md)] transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:scale-[1.02]"
              >
                {/* Placeholder Content */}
                <div className="flex h-full flex-col items-center justify-center p-6">
                  <item.icon className="h-12 w-12 text-sage transition-colors group-hover:text-meadow" />
                  <p className="mt-3 font-body text-sm text-stone">{item.category}</p>
                </div>

                {/* Hover Overlay with Caption */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-forest/90 via-forest/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 font-body text-sm text-sage">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
                href="/book"
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
