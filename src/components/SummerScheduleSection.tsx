'use client';
import { useState } from 'react';

interface ScheduleDay {
  day: string;
  theme: string;
  activities: string[];
}

interface ScheduleWeek {
  label: string;
  dates: string;
  days: ScheduleDay[];
}

const weeks: ScheduleWeek[] = [
  {
    label: 'Week One',
    dates: '6-10 July',
    days: [
      {
        day: 'Monday',
        theme: 'Amazing Farmers & Farm Machines',
        activities: [
          'Tractor Demo',
          'Meet the new animals',
          'Farmers who changed the world',
          'Farm Inventions (STEM Project)',
        ],
      },
      {
        day: 'Tuesday',
        theme: 'Farm to Fork',
        activities: [
          'Harvest to Soup Workshop',
          'Farmer Olympics',
          'Wax Resist Art',
          'Garden & Trail Signs',
        ],
      },
      {
        day: 'Wednesday',
        theme: 'Bees & Honey Ice Cream',
        activities: [
          'Inside the World of Bees',
          'Group build: Bug Hotel & Bee Garden (woodwork)',
          'Homemade Honey Ice Cream',
          '3D Bug Project',
        ],
      },
      {
        day: 'Thursday',
        theme: 'Young Farm Builders',
        activities: [
          'Woodwork: New Home for the Ducks',
          'Dragonfly Suncatchers (Art & Science Project)',
          'Sewing Pockets with Alba',
          'Cooking over a fire',
        ],
      },
      {
        day: 'Friday',
        theme: 'Berries & Storybook Farms',
        activities: [
          'Bunny Treats',
          'Berry Picking & Mini Berry Pies',
          'Storybook Farms',
          'Watercolour Animals with Andrea',
        ],
      },
    ],
  },
  {
    label: 'Week Two',
    dates: '13-17 July',
    days: [
      {
        day: 'Monday',
        theme: 'Amazing Farmers & Farm Machines',
        activities: [
          'Tractor Demo',
          'Meet the new animals',
          'Farmers who changed the world',
          'Farm Inventions (STEM Project)',
        ],
      },
      {
        day: 'Tuesday',
        theme: 'Farm to Fork',
        activities: [
          'Harvest to Soup Workshop',
          'Farmer Olympics',
          'Wax Resist Art',
          'Animal Facts Signs',
        ],
      },
      {
        day: 'Wednesday',
        theme: 'Bees & Honey Ice Cream',
        activities: [
          'Inside the World of Bees',
          'Group build: Pollinator House',
          'Homemade Honey Ice Cream',
          '3D Bug Project',
        ],
      },
      {
        day: 'Thursday',
        theme: 'Young Farm Builders',
        activities: [
          'Woodwork: Chicken Musical Instruments',
          'Art with Andrea',
          'Sewing Bunting with Alba',
          'Cooking over a fire',
        ],
      },
      {
        day: 'Friday',
        theme: 'Berries & Storybook Farms',
        activities: [
          'Bunny Treats',
          'Berry Picking & Mini Berry Pies',
          'Storybook Farms',
          'Watercolour Animals with Andrea',
        ],
      },
    ],
  },
  {
    label: 'Week Three',
    dates: '20-24 July',
    days: [
      {
        day: 'Monday',
        theme: 'Amazing Farmers & Farm Machines',
        activities: [
          'Tractor Demo',
          'Meet the new animals',
          'Farmers who changed the world',
          'Farm Inventions (STEM Project)',
        ],
      },
      {
        day: 'Tuesday',
        theme: 'Farm to Fork',
        activities: [
          'Harvest to Soup Workshop',
          'Farmer Olympics',
          'Group Mural',
          'Animal Enclosure Signs',
        ],
      },
      {
        day: 'Wednesday',
        theme: 'Bees & Honey Ice Cream',
        activities: [
          'Inside the World of Bees',
          'Group build: Pollinator House',
          'Make homemade Honey Ice Cream',
          '3D Bug Project',
        ],
      },
      {
        day: 'Thursday',
        theme: 'Young Farm Builders',
        activities: [
          'Woodwork: Home for the new chicks',
          'Nature Sketchbooks',
          'Basic Embroidery',
          'Cooking over a fire',
        ],
      },
      {
        day: 'Friday',
        theme: 'Berries & Storybook Farms',
        activities: [
          'Bunny Treats',
          'Berry Picking & Mini Berry Pies',
          'Storybook Farms',
          'Watercolour Animals with Andrea',
        ],
      },
    ],
  },
];

export default function SummerScheduleSection() {
  const [activeWeek, setActiveWeek] = useState(0);

  const week = weeks[activeWeek];

  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 md:px-8" style={{ backgroundColor: 'var(--craigies-olive)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl mb-4 text-white"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
            }}
          >
            Summer Schedule
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Every week has its own adventures — take a peek at what&apos;s planned!
          </p>
        </div>

        {/* Farm jobs & animal care callout */}
        <div
          className="max-w-3xl mx-auto mb-10 p-6 md:p-8 rounded-lg bg-white shadow-md text-center border-t-4"
          style={{ borderTopColor: 'var(--craigies-burnt-orange)' }}
        >
          <p
            className="text-xl md:text-2xl mb-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: 'var(--craigies-dark-olive)',
            }}
          >
            Farm jobs &amp; animal care are included every day!
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--craigies-dark-olive)' }}>
            Because we&apos;re based on a real working farm, no two days are ever quite the same.
            Sometimes the weather, animals, crops, or a special farm project may inspire us to
            switch things up &mdash; but that&apos;s all part of the adventure!
          </p>
        </div>

        {/* Week Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {weeks.map((w, i) => (
            <button
              key={w.label}
              onClick={() => setActiveWeek(i)}
              aria-pressed={activeWeek === i}
              className="px-6 py-3 rounded-lg font-semibold transition-colors"
              style={
                activeWeek === i
                  ? { backgroundColor: 'var(--craigies-burnt-orange)', color: 'white' }
                  : { backgroundColor: 'white', color: 'var(--craigies-dark-olive)' }
              }
            >
              <span className="block">{w.label}</span>
              <span className="block text-sm font-normal opacity-90">{w.dates}</span>
            </button>
          ))}
        </div>

        {/* Day Cards */}
        {week.days.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6">
            {week.days.map((d) => (
              <div
                key={d.day}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] p-6 rounded-lg bg-white shadow-md"
              >
                <p
                  className="text-sm font-semibold uppercase tracking-wide mb-1"
                  style={{ color: 'var(--craigies-burnt-orange)' }}
                >
                  {d.day}
                </p>
                <h3
                  className="text-xl mb-3"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    color: 'var(--craigies-dark-olive)',
                  }}
                >
                  {d.theme}
                </h3>
                <ul className="space-y-1.5">
                  {d.activities.map((activity) => (
                    <li
                      key={activity}
                      className="flex gap-2 text-sm leading-relaxed"
                      style={{ color: 'var(--craigies-dark-olive)' }}
                    >
                      <span aria-hidden="true" style={{ color: 'var(--craigies-burnt-orange)' }}>
                        &#10038;
                      </span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 rounded-lg bg-white/10">
            <p className="text-lg text-white">
              {week.label} schedule coming soon &mdash; watch this space!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
