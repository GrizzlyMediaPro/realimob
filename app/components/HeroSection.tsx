import Image from "next/image";
import HeroFilter from "./HeroFilter";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[50vh] flex justify-center">
      <div className="relative w-full max-w-[1350px] h-full">
        <Image
          src="/hero.jpg"
          alt="Hero"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay pentru vizibilitate text */}
        <div className="absolute inset-0 bg-black/40 z-0" />
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-8 z-10">
          <div className="text-center">
            <h1
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-kursk-medium)",
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)",
                color: "#E6EAF0"
              }}
            >
              Realimob.
            </h1>
            <p
              className="text-xl md:text-2xl lg:text-3xl"
              style={{
                fontFamily: "var(--font-galak-regular)",
                textShadow: "2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.5)",
                color: "#E6EAF0"
              }}
            >
              Noul standard pentru imobiliarele din București
            </p>
          </div>
        </div>
        {/* HeroFilter pe desktop */}
        <div className="hidden md:block">
          <HeroFilter />
        </div>
      </div>
    </section>
  );
}
