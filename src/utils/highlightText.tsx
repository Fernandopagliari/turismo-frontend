import React from 'react';

export const highlightText = (text: string, term: string) => {
  if (!term) return text;

  const regex = new RegExp(`(${term})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark
        key={i}
        className="
          bg-yellow-300 text-black
          px-1 rounded
          animate-highlight
        "
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};
