import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "The Clubhouse | Easter Holiday Club 2026 - Now Booking",
  description:
    "Book now for Easter 2026! Join our outdoor holiday club for children aged 5-12 at Craigies Farm, South Queensferry. Spring lambs, egg hunts, forest adventures, and farm activities.",
  openGraph: {
    title: "The Clubhouse | Easter Holiday Club 2026 - Now Booking",
    description:
      "Easter adventure at Craigies Farm! Meet spring lambs, explore woodland trails, and enjoy Easter activities. Ages 5-12. Limited spaces available.",
  },
};

// Testimonials from Google Reviews
const testimonials = [
  {
    quote:
      "By far the best summer camp for primary school aged kids. My son came home everyday telling me all the new and exciting things he had learned. Very well organised, and parents get photos and written updates as well. Nicole is super lovely and helpful. Top marks for Clubhouse program!",
    author: "Catherine Shen",
    role: "Google Review",
  },
  {
    quote:
      "The kids really loved their time at the Clubhouse Easter holiday! Fantastic activities - fun, educational and wonderful to see them enjoying being closer to nature. The staff were very enthusiastic and engaged well with the kids. We'll definitely be signing up again!",
    author: "Joanna Mackenzie",
    role: "Google Review",
  },
  {
    quote:
      "Our two children (7 and 9) had a fantastic time at the Clubhouse at Craigies this Easter. Over the course of the week they fed lambs, looked after baby chickens, got involved in all sorts of arts and crafts. They could not wait to go back each morning!",
    author: "Tom Malone",
    role: "Google Review",
  },
  {
    quote:
      "Signed my daughter up for a week of mornings at the clubhouse. She thoroughly enjoyed it and would have stayed full day. Nicole and the other adults were lovely. Her reply: 'The best thing was being with the animals and holding the chicks. I definitely want to go there again.'",
    author: "Lee Malcolm",
    role: "Google Review",
  },
  {
    quote:
      "My 10 year old and 6 year old daughters absolutely loved the summer club. They enjoyed every single day there. Thank you to the whole team for their effort, friendliness and super activities!",
    author: "Anna Ishkova",
    role: "Google Review",
  },
  {
    quote:
      "My kids really enjoyed the Clubhouse and have asked to go back on the next school holidays. I really appreciate the update on what they've done as well as them being fed lunch & snacks. Highly recommend.",
    author: "M K",
    role: "Google Review",
  },
  {
    quote:
      "My son attended a few days of summer camp and loved it. He got to take part in a good variety of brilliant farm experiences. Will definitely book another one!",
    author: "Lauren Scott",
    role: "Google Review",
  },
  {
    quote:
      "I signed my daughter up for a full day at the Clubhouse at Craigies and she enjoyed it sooo much! Nicole and her team are lovely. I can't wait to hear what the next program involves.",
    author: "Roxana Ghita",
    role: "Google Review",
  },
  {
    quote:
      "My daughter had two fantastic days jam packed full of experiences that you don't get anywhere else. It was well organised and well communicated. I would definitely book future holiday clubs.",
    author: "Nicky Bleakley",
    role: "Google Review",
  },
];

export default function HomePage() {
  const bannerImage = "https://res.cloudinary.com/dqicgqgmx/image/upload/v1769103900/Add-a-heading_olapvv.png";

  return (
    <div style={{ backgroundColor: 'var(--craigies-cream)' }}>
      {/* Banner - Made smaller */}
      <div className="w-full overflow-hidden">
        <img
          src={bannerImage}
          alt="The Clubhouse at Craigies"
          className="w-full h-48 md:h-64 lg:h-72 object-cover"
        />
      </div>

      {/* Hero Section with CTA */}
      <HeroSection />

      {/* Welcome Section */}
      <ContentSection
        title="Welcome to the Clubhouse!"
        content="Where children ages 5-12 join us for outdoor, hands-on learning sessions. Set on a working farm with forest, fields and friendly animals!"
        imageUrl="https://res.cloudinary.com/dqicgqgmx/image/upload/v1768924052/d12ad9e7-690c-4cb0-8761-efb841ffbade_jgrvaf.jpg"
        imageAlt="Children enjoying activities at The Clubhouse"
        imagePosition="left"
        shouldTruncate={false}
        backgroundColor="olive"
      />

      {/* On the Farm Section */}
      <ContentSection
        title="On the Farm!"
        content={`There really is no better setting for a classroom — from our farm-to-fork cooking classes to our STEM lessons exploring new farming technology and innovations. At The Clubhouse, children learn the science of growing, animal care, woodworking, and other traditional skills, all through hands-on experience.

During Spring, we were busy caring for baby chicks and lambs — including the unforgettable experience of bottle-feeding them! We get our allotments up and running, build fantastic enrichment toys in our woodworking sessions, plant pumpkins, and make the most of wonderfully warm and sunny days spent outdoors.

In Autumn, we jumped straight back into harvesting, learning to pickle and preserve our summer crops, and watching the farm transform with the season. The kids loved foraging for wild ingredients, pressing apple juice, and preparing the beds for winter crops.

Now, as the days grow lighter and the first signs of spring appear, we're getting ready to welcome new life on the farm again. Soon we'll be planting seeds, tending to baby animals, and exploring all the wonders of springtime at Craigies.

With Spring just around the corner, the kids will be back in the soil — learning how to germinate seeds, raise and care for seedlings, mulch and weed beds, support climbing plants, and understand what helps crops thrive. They'll head out on rounds with the farmers, test soil pH, learn what grows best in different areas of the farm, visit the beehives, and see how farming works on both small and large scales. 🌱`}
        imageUrl="https://res.cloudinary.com/dqicgqgmx/image/upload/v1768924052/IMG_1176-scaled_pemded.jpg"
        imageAlt="Farm activities and learning"
        imagePosition="right"
        shouldTruncate={true}
        previewLength={350}
        backgroundColor="cream"
      />

      {/* Explore the Forest Section */}
      <ContentSection
        title="Explore the Forest!"
        content="At The Clubhouse, the forest is our classroom! Kids will learn through hands-on adventures in the mile-long woodlands adjacent to the farm. With our in-house forest ranger, the kids walk the beautiful paths cut through the woods and learn all sorts of useful information about the forest, animals and mini-beasts that live there. From den building and bug hunts to learning about local wildlife, our forest sessions will give them a greater understanding of Scottish woodlands."
        imageUrl="https://res.cloudinary.com/dqicgqgmx/image/upload/v1768924052/043917ba-162f-4160-8072-97e389e93b92-2_aswr8s.jpg"
        imageAlt="Children exploring the forest"
        imagePosition="left"
        shouldTruncate={false}
        backgroundColor="olive"
      />

      {/* Caring for Farm Animals Section */}
      <ContentSection
        title="Caring for the Farm Animals"
        content={`At The Clubhouse, kids don't just visit the farm—they become part of it! From helping with bottle-feeding new lambs to helping raise chicks this past spring, children get hands-on experience caring for animals while learning how a farm works and the basics of animal care.

They've helped to chop and prep treats, feed the goats, brush the ponies, and build animal enrichment activities for the farm. With all sorts of treasures found around the farm—like suet from the butcher for bird feeders or old fruit baskets turned into animal toys—the farm becomes a brilliant little world for learning how to reuse and get creative.

Whether it's cuddling a fluffy chick or watching lambs take their first steps, every moment is a fun and unforgettable lesson in animal care. The children develop empathy and responsibility while forming special bonds with our farmyard friends.`}
        imageUrl="https://res.cloudinary.com/dqicgqgmx/image/upload/v1768924052/IMG_8406_ejjgwy.jpg"
        imageAlt="Children caring for farm animals"
        imagePosition="right"
        shouldTruncate={true}
        previewLength={300}
        backgroundColor="cream"
      />

      {/* Testimonials Section */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
