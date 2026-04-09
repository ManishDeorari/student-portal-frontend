import React, { useRef, useState, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const DEFAULT_OFFSET = { x: 0, y: 0 };

const EmojiPickerToggle = ({
  onEmojiSelect,
  iconSize = "text-xl",
  icon = "😀",
  offset = DEFAULT_OFFSET,
  placement = "auto", // "top", "bottom", or "auto"
  isCentered = false, // New prop for viewport centering
  darkMode = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStyle, setPickerStyle] = useState({ top: "0px", left: "0px" });
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePicker = (e) => {
    e.stopPropagation();
    setShowPicker((prev) => !prev);
  };

  const handleClickOutside = (e) => {
    if (
      pickerRef.current &&
      !pickerRef.current.contains(e.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target)
    ) {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);

      const updatePosition = () => {
        if (isCentered) {
          setPickerStyle({
            position: "fixed",
            zIndex: 9999,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          });
          return;
        }

        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Dimensions for the picker
          const pickerWidth = 352;
          const pickerHeight = 440;

          const style = {
            position: "fixed",
            zIndex: 9999,
          };

          // Vertical placement decision
          const spaceBelow = windowHeight - rect.bottom;
          const spaceAbove = rect.top;

          const PICKER_BUFFER = 40; // Avoid flipping too easily

          let finalPlacement = placement;
          if (placement === "auto") {
            // If current placement is bottom but space is tight, flip to top
            if (spaceBelow < pickerHeight + PICKER_BUFFER && spaceAbove > pickerHeight + PICKER_BUFFER) {
              finalPlacement = "top";
            } else if (spaceAbove < pickerHeight + PICKER_BUFFER && spaceBelow > pickerHeight + PICKER_BUFFER) {
              finalPlacement = "bottom";
            } else {
              // Default to where there's more space
              finalPlacement = spaceBelow > spaceAbove ? "bottom" : "top";
            }
          }

          if (finalPlacement === "top") {
            style.bottom = `${windowHeight - rect.top + 8 + offset.y}px`;
          } else {
            style.top = `${rect.bottom + 8 + offset.y}px`;
          }

          // Horizontal placement (center relative to button, but stay in viewport)
          let leftPos = rect.left + (rect.width / 2) - (pickerWidth / 2) + offset.x;

          // boundary checks
          if (leftPos < 10) leftPos = 10;
          if (leftPos + pickerWidth > windowWidth - 10) {
            leftPos = windowWidth - pickerWidth - 10;
          }

          style.left = `${leftPos}px`;

          setPickerStyle(style);
        }
      };

      let rafId = null;
      const onScrollOrResize = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updatePosition);
      };

      updatePosition();
      window.addEventListener("scroll", onScrollOrResize, { capture: true, passive: true });
      window.addEventListener("resize", onScrollOrResize);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener("scroll", onScrollOrResize, { capture: true });
        window.removeEventListener("resize", onScrollOrResize);
      };
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, offset, isCentered, placement]);

  // Responsive settings
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        className={`relative ${iconSize} hover:scale-110 transition-transform`}
        onClick={togglePicker}
      >
        {icon}
      </button>

      {mounted && showPicker && createPortal(
        <AnimatePresence>
          <motion.div
            ref={pickerRef}
            className="shadow-2xl rounded-xl overflow-hidden ring-1 ring-black ring-opacity-5"
            style={pickerStyle}
            initial={isCentered ? { opacity: 0, scale: 0.9 } : { opacity: 0, scale: 0.9, y: 10 }}
            animate={isCentered ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isCentered ? { opacity: 0, scale: 0.9 } : { opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji) => {
                onEmojiSelect(emoji);
              }}
              theme={darkMode ? "dark" : "light"}
              perLine={isMobile ? 7 : 8}
              emojiSize={isMobile ? 22 : 24}
              emojiButtonSize={isMobile ? 32 : 36}
            />
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default EmojiPickerToggle;
