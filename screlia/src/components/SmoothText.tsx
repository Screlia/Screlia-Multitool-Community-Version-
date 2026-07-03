import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SmoothTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export function SmoothText({ text, className, speed = 0.01 }: SmoothTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  
  // For markdown, it's tricky to type character by character without breaking syntax.
  // A better approach for "smoothness" with markdown is a fade-in effect.
  // If we want typing, we should type the raw text, but that looks bad with markdown syntax visible.
  // So we will use a fade-in effect for the whole block, or split by paragraphs.
  
  // However, the user specifically asked for "smoother effect".
  // Let's do a word-by-word reveal if it's plain text, but for Markdown, 
  // let's stick to a nice fade-in of the whole content to ensure rendering correctness.
  
  // Actually, let's try a simple opacity animation.
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </motion.div>
  );
}
