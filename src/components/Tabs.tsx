"use client";

import { useState, type ReactNode } from "react";

export default function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`min-h-11 rounded-t-xl px-4 text-sm font-semibold ${
              active === i ? "bg-white text-[#2f8f2f] shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{tabs[active]?.content}</div>
    </div>
  );
}
