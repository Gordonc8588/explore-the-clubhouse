import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Meet the passionate team behind The Clubhouse. Learn about our mission to inspire a love of nature and outdoor learning in every child through hands-on farm adventures.",
  openGraph: {
    title: "About Us | The Clubhouse",
    description:
      "Meet the passionate team behind The Clubhouse. Learn about our mission to inspire a love of nature and outdoor learning in every child.",
  },
};

const teamMembers = [
  {
    name: "Nicole Calder",
    role: "Founder",
    bio: "Nicole founded The Clubhouse after time spent in Africa, where she discovered a farm that allowed kids to participate in everyday life. Wanting to create something similar in Scotland, she combined experience from delivering events and familiarity with childcare, having grown up with her mum running a nursery, to build a space where children could learn, explore, and be part of real farm life.",
    image: "https://res.cloudinary.com/dqicgqgmx/image/upload/v1768934188/05658c31-5bc1-45db-882a-59274dba8dca-e1745677786658_jikvsn.jpg",
  },
  {
    name: "Chris Hardie",
    role: "Activities Lead",
    bio: "Chris is an animal biologist who spent six years as a local forest ranger and the last five as an animal encounters zookeeper. He leads the children in a wide range of activities, from forest skills, survival skills, and exploration to interacting with and caring for the friendly animals around the farm.",
    image: "https://res.cloudinary.com/dqicgqgmx/image/upload/v1768924049/9a27d5e0-f273-4833-8022-13d8f768d058_mlspf0.jpg",
  },
  {
    name: "Lisa Taylor",
    role: "Animal Care Lead",
    bio: "Lisa is a farm girl through and through, raised on her family dairy farm and splitting her days between her own and neighbouring farms. She is currently studying to become a veterinarian and leads lessons in animal care, health checks, feeding, and animal growth stages.",
    image: "https://res.cloudinary.com/dqicgqgmx/image/upload/v1768924054/6e5ba4bf-9c64-4b31-bca4-3e1523a17737_zqglgr.jpg",
  },
  {
    name: "Kirsteen Benson",
    role: "Crafts & Workshops Lead",
    bio: "Kirsteen, BA (Hons), the child of two artists from Glasgow, has decades of experience teaching in schools, running workshops, and leading craft fairs. She brings a wide range of craft skills to The Clubhouse, from woodworking and kite making to building structures for the allotment, helping turn everyday activities into creative projects.",
    image: "https://res.cloudinary.com/dqicgqgmx/image/upload/v1768924049/ed7d91f4-e867-4028-9bdb-1bd660d79b7e_w613ht.jpg",
  },
];

export default function AboutPage() {
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
              About Us
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-white/90 sm:text-xl">
              Discover the heart behind The Clubhouse and the passionate
              team dedicated to creating unforgettable outdoor adventures for
              your children.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src="https://res.cloudinary.com/dqicgqgmx/image/upload/v1768924052/IMG_3328-scaled_tkpsb8.jpg"
                  alt="Children enjoying activities at The Clubhouse"
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div
                className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl opacity-20"
                style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
              />
            </div>

            {/* Story Content */}
            <div>
              <h2
                className="text-3xl font-bold sm:text-4xl"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Our Story
              </h2>
              <div
                className="mt-6 space-y-4 font-body text-lg leading-relaxed"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                <p>
                  At The Clubhouse at Craigies, we believe learning is often best when done
                  &quot;on the job&quot; – keeping it relevant, interesting and fun. Our approach
                  is all about hands-on experiences that spark imagination and build
                  a lifelong love of learning.
                </p>
                <p>
                  We&apos;ve created an environment where children can enjoy their time out of
                  school by connecting with nature, developing real-world skills, and getting
                  involved in the day to day activities of a working farm. Farms are unique as
                  children of all ages can find themselves useful, and so much can be learned
                  at any stage.
                </p>
              </div>

              {/* Mission Statement */}
              <div
                className="mt-8 rounded-xl border-l-4 bg-white p-6 shadow-md"
                style={{ borderColor: "var(--craigies-burnt-orange)" }}
              >
                <p
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-burnt-orange)",
                  }}
                >
                  Our Mission
                </p>
                <p
                  className="mt-2 font-body text-lg"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  To inspire a love of learning in every child, and building confidence
                  through hands-on adventures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Meet Our Team
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl font-body text-lg"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Our dedicated team brings together knowledge of childcare, outdoor
              education, and animal husbandry to create the perfect holiday
              experience.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Photo */}
                  <div className="mx-auto sm:mx-0 h-32 w-32 flex-shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3
                      className="text-xl font-semibold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}
                    >
                      {member.name}
                    </h3>
                    <p
                      className="font-body text-sm font-medium"
                      style={{ color: "var(--craigies-burnt-orange)" }}
                    >
                      {member.role}
                    </p>
                    <p
                      className="mt-3 font-body text-sm leading-relaxed"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              Ready to Book Your Child&apos;s Adventure?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-lg text-white/90">
              Join us for an unforgettable holiday club experience filled with farm activities, forest exploration, and hands-on learning. Spaces are limited – secure your child&apos;s spot today!
            </p>
            <div className="mt-8">
              <a
                href="/clubs#upcoming-events"
                className="inline-block rounded-lg px-10 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: "var(--craigies-burnt-orange)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Book Your Spot Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
