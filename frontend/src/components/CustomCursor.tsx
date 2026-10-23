import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTextHovered, setIsTextHovered] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Outer follower has lag spring
  const springConfig = { damping: 30, stiffness: 220 };
  const followerX = useSpring(cursorX, springConfig);
  const followerY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Event delegation to track interactive element hover with state change checks
    // This reduces component re-renders from dozens per second to only transition moments!
    let lastClickable = false;
    let lastText = false;
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isClickable = !!target.closest('a, button, [role="button"], input[type="submit"], select, .royal-card, .group, [onclick]');
      const isText = !!target.closest('input[type="text"], input[type="email"], input[type="password"], textarea, [contenteditable="true"]');
      
      if (isClickable !== lastClickable) {
        lastClickable = isClickable;
        setIsHovered(isClickable);
      }
      if (isText !== lastText) {
        lastText = isText;
        setIsTextHovered(isText);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Inner Dot / Spinner */}
      <motion.div
        className="custom-cursor"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isClicking ? 0.7 : isHovered ? 0.5 : isTextHovered ? 0.3 : 1,
          opacity: isTextHovered ? 0.4 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        <div className="custom-cursor-inner" />
      </motion.div>
      
      {/* Outer Follower Ring */}
      <motion.div
        className="custom-cursor-follower"
        style={{
          x: followerX,
          y: followerY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isClicking ? 0.55 : isHovered ? 1.6 : isTextHovered ? 0.25 : 1,
          borderColor: isHovered 
            ? "hsl(var(--primary))" 
            : isTextHovered 
            ? "hsl(var(--secondary) / 0.2)"
            : "hsl(var(--secondary) / 0.5)",
          backgroundColor: isHovered 
            ? "hsl(var(--secondary) / 0.16)" 
            : "rgba(0,0,0,0)",
          borderWidth: isHovered ? "2.5px" : "1.5px",
        }}
        transition={{ type: "spring", stiffness: 220, damping: 25 }}
      />
    </>
  );
}
