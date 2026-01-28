'use client';

interface DaySelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function DaySelector({ value, onChange }: DaySelectorProps) {
  const handleToggle = (day: string) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  return (
    <div className="mt-4 p-4 bg-[#f5f4ed]/50 rounded-lg border border-[#7a7c4a]/20">
      <p className="text-sm font-medium text-[#5a5c3a] mb-3">
        Which specific days?
      </p>

      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const isSelected = value.includes(day);
          const shortDay = day.slice(0, 3);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleToggle(day)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                ${isSelected
                  ? 'bg-[#7a7c4a] text-white'
                  : 'bg-white text-[#5a5c3a] border border-[#d1d5db] hover:border-[#7a7c4a]'
                }
              `}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{shortDay}</span>
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <p className="text-xs text-[#7a7c4a] mt-3">
          Selected: {value.join(', ')}
        </p>
      )}
    </div>
  );
}
