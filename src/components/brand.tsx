import Link from "next/link";
import Image from "next/image";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  const src = inverse ? "/brand/logo-horizontal-reversed.svg" : "/brand/logo-horizontal.svg";

  return (
    <Link href="/" className="group inline-flex items-center" aria-label="Corevexal home">
      {/* intrinsic 2048×978 viewBox — ratio 2.094:1; h-9 = 36px → w ≈ 75px */}
      <Image
        src={src}
        alt="Corevexal"
        width={2048}
        height={978}
        className="h-10 w-auto md:h-12"
        priority
        unoptimized
      />
    </Link>
  );
}
