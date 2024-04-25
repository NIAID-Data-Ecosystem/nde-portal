import React from 'react';

// Highlights the words in a text given a set of words to match.
// See example: https://codesandbox.io/s/text-highlighting-vk1hj?file=/src/App.js
interface HighlightProps {
  tags: string[];
  children: React.ReactNode;
}
export const Highlight: React.FC<HighlightProps> = ({
  children: text = '',
  tags = [],
}) => {
  if (typeof text !== 'string' || !tags?.length) return <>{text}</>;

  const matches = [
    ...text.matchAll(
      new RegExp(
        // escape characters tha timpact regex.
        tags.join('|').replace(/[\[\]\(\)\/\\/\{\}\*]/g, '\\$&'),
        'ig',
      ),
    ),
  ];

  const startText = text.slice(0, matches[0]?.index);
  return (
    <>
      {startText}
      {matches.map((match, i) => {
        const startIndex = match.index || 0;
        const currentText = match[0];
        const endIndex = startIndex + currentText.length;
        const nextIndex = matches[i + 1]?.index;
        const untilNextText = text.slice(endIndex, nextIndex);
        return (
          <span key={i}>
            <mark className='search-term'>{currentText}</mark>
            {untilNextText}
          </span>
        );
      })}
    </>
  );
};
