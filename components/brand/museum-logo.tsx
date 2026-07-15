import Image from "next/image";

type MuseumLogoProps = {
  className?: string;
  priority?: boolean;
  size?: number;
};

function MuseumLogo({ className, priority = false, size = 48 }: MuseumLogoProps) {
  return (
    <Image
      src="/brand/war-remnants-museum-logo.png"
      width={size}
      height={size}
      sizes={`${size}px`}
      alt="Biểu trưng Bảo tàng Chứng tích Chiến tranh"
      priority={priority}
      draggable={false}
      className={className}
    />
  );
}

export { MuseumLogo };
