import { useState, useEffect } from "react";

export function useTypewriter(words: string[], speed: number = 100) {
  const [displayText, setDisplayText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentWord = words[currentWordIndex];

      if (!isDeleting) {
        // Typing forward
        if (currentCharIndex < currentWord.length) {
          setDisplayText(currentWord.substring(0, currentCharIndex + 1));
          setCurrentCharIndex(currentCharIndex + 1);
        } else {
          // Pause before deleting
          setTimeout(() => {
            setIsDeleting(true);
          }, 2000);
        }
      } else {
        // Deleting backward
        if (currentCharIndex > 0) {
          setDisplayText(currentWord.substring(0, currentCharIndex - 1));
          setCurrentCharIndex(currentCharIndex - 1);
        } else {
          // Move to next word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          setCurrentCharIndex(0);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timer);
  }, [currentCharIndex, currentWordIndex, isDeleting, words, speed]);

  return displayText;
}
