import {
  Heart,
  Leaf,
  Users,
  Shield,
  Sparkles,
  TreePine,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Nurturing Care",
    description:
      "Every child is welcomed into a warm, supportive environment where they feel safe to explore, learn, and grow at their own pace.",
  },
  {
    icon: Leaf,
    title: "Connection to Nature",
    description:
      "We believe in the power of outdoor play and hands-on experiences with nature to foster curiosity, resilience, and a love for the environment.",
  },
  {
    icon: Users,
    title: "Community Spirit",
    description:
      "We build lasting friendships and a sense of belonging, creating a community where children and families feel part of something special.",
  },
  {
    icon: Shield,
    title: "Safety First",
    description:
      "The wellbeing of every child is our top priority. Our qualified staff and comprehensive policies ensure a secure environment for all.",
  },
  {
    icon: Sparkles,
    title: "Joy & Adventure",
    description:
      "We create magical moments filled with laughter, discovery, and excitement that children will treasure and talk about for years to come.",
  },
  {
    icon: TreePine,
    title: "Sustainable Practices",
    description:
      "We teach children to respect and care for our planet through eco-friendly activities and responsible stewardship of our farm and land.",
  },
];

const teamMembers = [
  {
    name: "Sarah Thompson",
    role: "Founder & Director",
    bio: "With over 15 years of experience in childcare and a passion for outdoor education, Sarah founded The Clubhouse to give children the farm adventures she loved as a child.",
  },
  {
    name: "James Wilson",
    role: "Activities Manager",
    bio: "A qualified forest school leader and wildlife enthusiast, James designs our engaging outdoor programmes that spark curiosity and wonder in every child.",
  },
  {
    name: "Emily Chen",
    role: "Farm & Animal Care Lead",
    bio: "Emily brings her agricultural background and gentle nature to manage our animal family, teaching children about responsibility and compassion through hands-on care.",
  },
  {
    name: "Michael Davies",
    role: "Safeguarding Officer",
    bio: "With extensive experience in child protection, Michael ensures our policies and practices keep every child safe while maintaining a fun, welcoming atmosphere.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sage/30 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-bark sm:text-5xl">
              About Us
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-stone sm:text-xl">
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
            {/* Image Placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-sage/20">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <TreePine className="mx-auto h-16 w-16 text-sage" />
                    <p className="mt-4 font-body text-stone">Farm image placeholder</p>
                  </div>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-sunshine/20" />
            </div>

            {/* Story Content */}
            <div>
              <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl">
                Our Story
              </h2>
              <div className="mt-6 space-y-4 font-body text-stone">
                <p>
                  The Clubhouse was born from a simple belief: children
                  thrive when they connect with nature, animals, and the great
                  outdoors. Founded in the heart of the countryside, our
                  farm-based holiday club offers something truly special for
                  families during school breaks.
                </p>
                <p>
                  What started as a small summer programme has grown into a
                  beloved destination where children aged 4-12 discover the joys
                  of farm life, outdoor adventures, and making friends in a safe,
                  nurturing environment.
                </p>
                <p>
                  Every day at the Clubhouse is filled with opportunities to
                  explore, learn, and play. From feeding our friendly farm animals
                  to building dens in the woods, pond dipping to nature crafts,
                  we create experiences that children remember for a lifetime.
                </p>
              </div>

              {/* Mission Statement */}
              <div className="mt-8 rounded-xl border-l-4 border-forest bg-white p-6 shadow-[var(--shadow-md)]">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-meadow">
                  Our Mission
                </p>
                <p className="mt-2 font-body text-lg text-bark">
                  To inspire a love of nature and outdoor learning in every child,
                  creating joyful memories and building confidence through hands-on
                  farm adventures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-forest py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Our Values
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-sage">
              These core values guide everything we do at The Clubhouse,
              shaping the experiences we create and the care we provide.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sunshine/20">
                  <value.icon className="h-6 w-6 text-sunshine" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  {value.title}
                </h3>
                <p className="mt-2 font-body text-sage">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-stone">
              Our dedicated team brings together expertise in childcare, outdoor
              education, and animal husbandry to create the perfect holiday
              experience.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] transition-shadow hover:shadow-[var(--shadow-lg)]"
              >
                {/* Avatar Placeholder */}
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-sage/30">
                  <div className="flex h-full items-center justify-center">
                    <Users className="h-10 w-10 text-sage" />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-display text-lg font-semibold text-bark">
                    {member.name}
                  </h3>
                  <p className="font-body text-sm font-medium text-meadow">
                    {member.role}
                  </p>
                  <p className="mt-3 font-body text-sm text-stone">
                    {member.bio}
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
              Come and Visit Us
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-lg text-sage">
              We&apos;d love to show you around our farm and answer any questions
              you have. Get in touch to arrange a visit or book your
              child&apos;s place.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/book"
                className="inline-block rounded-lg bg-sunshine px-8 py-3 font-display text-lg font-semibold text-bark transition-colors hover:bg-amber focus:outline-none focus:ring-2 focus:ring-sunshine focus:ring-offset-2 focus:ring-offset-forest"
              >
                Book Now
              </a>
              <a
                href="/contact"
                className="inline-block rounded-lg border-2 border-white px-8 py-3 font-display text-lg font-semibold text-white transition-colors hover:bg-white hover:text-forest focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-forest"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
