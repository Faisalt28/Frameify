import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface LensProps {
  children: React.ReactNode;
  zoomFactor?: number;
  lensSize?: number;
  position?: {
    x: number;
    y: number;
  };
  isStatic?: boolean;
  isFocusing?: () => void;
  hovering?: boolean;
  setHovering?: (hovering: boolean) => void;
}

export const Lens: React.FC<LensProps> = ({
  children,
  zoomFactor = 2.4,
  lensSize = 180,
  isStatic = false,
  position = { x: 200, y: 150 },
  hovering,
  setHovering,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localIsHovering, setLocalIsHovering] = useState(false);
  const isHovering = hovering !== undefined ? hovering : localIsHovering;
  const setIsHovering = setHovering || setLocalIsHovering;
  const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });

  const updatePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    updatePosition(e);
    setIsHovering(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Render layer zoom menggunakan elemen <img> standar murni (Native HTML)
  // Ini SANGAT PENTING: Jika menggunakan <motion.img> atau elemen dengan layoutId yang sama,
  // Framer Motion akan otomatis menyembunyikan (opacity: 0) gambar asli karena duplikasi ID layout.
  // Dengan elemen <img> native, gambar dasar tetap 100% terlihat dan tidak akan pernah hilang.
  const renderZoomContent = () => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const props = child.props as any;
        if (props.src) {
          return (
            <img
              src={props.src}
              alt={props.alt || "Zoomed preview"}
              className={props.className}
              style={{
                ...props.style,
                pointerEvents: "none",
                userSelect: "none",
              }}
              draggable={false}
            />
          );
        }
        // Fallback jika child bukan img: hilangkan layoutId dan props motion agar tidak konflik
        const { layoutId, animate, initial, exit, variants, transition, ...restProps } = props;
        return React.cloneElement(child, {
          ...restProps,
          style: { ...restProps.style, pointerEvents: "none" },
        });
      }
      return child;
    });
  };

  const activePos = isStatic ? position : mousePosition;
  const radius = lensSize / 2;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl z-20 cursor-crosshair select-none inline-block max-w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Layer Gambar Asli (Selalu tetap tampil dan stabil) */}
      <div className="relative z-10 block">
        {children}
      </div>

      {/* Layer Lensa Kaca Pembesar (Lup Zoom) */}
      <AnimatePresence>
        {(isStatic || isHovering) && (
          <div className="pointer-events-none">
            {/* Area Terpotong Lingkaran Kaca Pembesar dengan Zoom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute inset-0 z-40 overflow-hidden pointer-events-none"
              style={{
                clipPath: `circle(${radius}px at ${activePos.x}px ${activePos.y}px)`,
                WebkitClipPath: `circle(${radius}px at ${activePos.x}px ${activePos.y}px)`,
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  transform: `scale(${zoomFactor})`,
                  transformOrigin: `${activePos.x}px ${activePos.y}px`,
                }}
              >
                {renderZoomContent()}
              </div>
            </motion.div>

            {/* Frame Lingkaran Kaca Pembesar (Rim Lensa Optik Realistis) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute pointer-events-none z-50"
              style={{
                left: activePos.x - radius,
                top: activePos.y - radius,
                width: lensSize,
                height: lensSize,
                borderRadius: "50%",
                boxShadow:
                  "0 14px 40px rgba(0, 0, 0, 0.7), 0 0 0 3px rgba(255, 255, 255, 0.9), inset 0 0 20px rgba(0, 0, 0, 0.35)",
                background:
                  "radial-gradient(circle at center, transparent 60%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.25) 90%, transparent 100%)",
              }}
            >
              {/* Titik fokus halus di tengah lensa lup */}
              <div className="absolute inset-0 flex items-center justify-center opacity-35">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lens;
