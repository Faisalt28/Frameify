import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X, Download, Share2, Check } from "lucide-react"
import { Lens } from "@/components/ui/magnifier-lens"

// --- Types ---
export interface ImageData {
  id: string
  src: string
  alt?: string
}

interface GalleryContextType {
  selectedImage: ImageData | null
  setSelectedImage: (image: ImageData | null) => void
}

const GalleryContext = React.createContext<GalleryContextType | null>(null)

// --- Physics ---
const spring = {
  type: "spring" as const,
  stiffness: 350,
  damping: 35,
  mass: 1,
}

// --- Components ---

/**
 * Root Gallery Provider
 * Manages the state of the expanded image and renders the Modal.
 */
export function Gallery({ children }: { children: React.ReactNode }) {
  const [selectedImage, setSelectedImage] = React.useState<ImageData | null>(null)

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [selectedImage])

  return (
    <GalleryContext.Provider value={{ selectedImage, setSelectedImage }}>
      {children}
      <GalleryModal />
    </GalleryContext.Provider>
  )
}

/**
 * Responsive Full-Screen Masonry Grid
 */
export function GalleryGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "columns-2 gap-2.5 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 w-full",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Individual Gallery Image Thumbnail
 */
export function GalleryImage({
  src,
  alt,
  id,
  className,
}: {
  src: string
  alt?: string
  id: string
  className?: string
}) {
  const context = React.useContext(GalleryContext)
  if (!context) throw new Error("GalleryImage must be used within a Gallery")

  return (
    <motion.div
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "relative mb-2.5 sm:mb-4 break-inside-avoid cursor-zoom-in rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300",
        className
      )}
      onClick={() => context.setSelectedImage({ id, src, alt })}
    >
      <motion.img
        layoutId={`image-${id}`}
        src={src}
        alt={alt || "Gallery Image"}
        loading="lazy"
        className="w-full h-auto object-cover rounded-xl"
        variants={{
          hover: { scale: 0.98 },
          tap: { scale: 0.95 },
        }}
        transition={spring}
      />

      {/* Subtle hover overlay for premium feel */}
      <motion.div
        variants={{
          hover: { opacity: 1 },
          tap: { opacity: 1 },
        }}
        initial={{ opacity: 0 }}
        className="absolute inset-0 bg-black/10 pointer-events-none rounded-xl"
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}

/**
 * Expanded View Modal with Lens Zoom Magnifier, Download & Share
 */
function GalleryModal() {
  const context = React.useContext(GalleryContext)
  const [copied, setCopied] = React.useState(false)

  if (!context) return null

  const { selectedImage, setSelectedImage } = context

  // Download handler
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedImage) return

    try {
      // Ambil file sebagai blob agar memicu unduhan langsung
      const res = await fetch(selectedImage.src)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `frameify-${selectedImage.id}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      // Fallback: Buka di tab baru
      window.open(selectedImage.src, "_blank", "noopener,noreferrer")
    }
  }

  // Share handler
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedImage) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: "FRAMEIFY Photography",
          text: selectedImage.alt || "Lihat foto lanskap indah ini di FRAMEIFY",
          url: selectedImage.src,
        })
        return
      } catch {
        // Fallback to clipboard jika user cancel
      }
    }

    try {
      await navigator.clipboard.writeText(selectedImage.src)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.warn("Gagal menyalin tautan ke clipboard")
    }
  }

  return (
    <AnimatePresence>
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 md:p-8">
          {/* Frosted glass backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            onClick={() => setSelectedImage(null)}
          />

          {/* Action Toolbar di Kanan Atas: Share, Download, Close */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.08, duration: 0.2 }}
            className="absolute top-3 right-3 sm:top-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/25 active:bg-white/30 transition-all shadow-lg border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
              title="Bagikan foto"
              aria-label="Share photo"
            >
              {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              {copied && <span className="text-[11px] font-semibold pr-1 text-emerald-400">Tersalin!</span>}
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/25 active:bg-white/30 transition-all shadow-lg border border-white/10 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
              title="Unduh resolusi tinggi"
              aria-label="Download image"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-2 sm:p-2.5 min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/25 active:bg-white/30 transition-all shadow-lg border border-white/10 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
              title="Tutup (Esc)"
              aria-label="Close gallery"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </motion.div>

          {/* Container Gambar Modal dengan Lensa Zoom Lup (Magnifier Lens) */}
          <div
            className="relative z-10 max-w-[94vw] max-h-[76vh] sm:max-h-[84vh] flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <Lens zoomFactor={2.4}>
              <motion.img
                layoutId={`image-${selectedImage.id}`}
                src={selectedImage.src}
                alt={selectedImage.alt || "Selected gallery image"}
                className="w-auto h-auto max-w-[92vw] max-h-[72vh] sm:max-h-[80vh] rounded-xl sm:rounded-2xl shadow-2xl object-contain pointer-events-auto"
                draggable={false}
                transition={spring}
              />
            </Lens>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
