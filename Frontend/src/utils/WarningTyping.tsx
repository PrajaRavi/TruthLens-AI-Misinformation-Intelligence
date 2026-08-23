import React, { useEffect, useState } from "react";

interface WarningTypingProps {
  warnings: string[];
  typingSpeed?: number;
  sentenceInterval?: number;
}

const WarningTyping: React.FC<WarningTypingProps> = ({
  warnings,
  typingSpeed = 40,
  sentenceInterval = 2000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!warnings.length) return;

    const currentWarning = warnings[currentIndex];

    let charIndex = 0;

    setDisplayedText("");

    const typingTimer = setInterval(() => {
      if (charIndex < currentWarning.length) {
        setDisplayedText((prev) => prev + currentWarning[charIndex]);
        charIndex++;
      } else {
        clearInterval(typingTimer);
      }
    }, typingSpeed);

    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % warnings.length);
    }, currentWarning.length * typingSpeed + sentenceInterval);

    return () => {
      clearInterval(typingTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, warnings, typingSpeed, sentenceInterval]);

  if (!warnings.length) return null;

  return (
    <div className="text-red-500">
      <p className="leading-relaxed">
      {displayedText}
        <span className="animate-pulse">|</span>
      </p>
    </div>
  );
};

export default WarningTyping;