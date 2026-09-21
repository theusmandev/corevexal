import Link from "next/link";
import Image from "next/image";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  const src = inverse ? "/brand/logo-horizontal-reversed.svg" : "/brand/logo-horizontal.svg";

  return (
    <Link href="/" className="group inline-flex items-center" aria-label="Corevexal home">
      <Image src={src} alt="Corevexal" width={180} height={40} className="h-8 w-auto" priority />
    </Link>
  );
}
