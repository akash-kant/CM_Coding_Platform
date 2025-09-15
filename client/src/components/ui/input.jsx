"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    const radius = 100; // change this to increase the rdaius of the hover effect
    const [visible, setVisible] = React.useState(false);

    let mouseX = 0;
    let mouseY = 0;

    function handleMouseMove({ currentTarget, clientX, clientY }) {
      let { left, top } = currentTarget.getBoundingClientRect();

      mouseX = clientX - left;
      mouseY = clientY - top;
    }
    return (
      <motion.div
        style={{
          background: "rgb(255 255 255 / 0.1)",
          borderRadius: "8px",
          border: "1px solid rgb(255 255 255 / 0.3)",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="p-2 rounded-lg relative w-full"
      >
        <motion.div
          className="pointer-events-none"
          style={{
            background: `radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, var(--cyan-500), transparent 80%)`,
            opacity: visible ? 1 : 0,
            transition: "opacity .5s",
          }}
        />
        <input
          type={type}
          className={cn(
            `flex h-10 w-full border-none bg-transparent text-white placeholder:text-neutral-400 focus:outline-none focus:ring-0 text-sm file:border-0 file:bg-transparent 
            file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  }
);
Input.displayName = "Input";