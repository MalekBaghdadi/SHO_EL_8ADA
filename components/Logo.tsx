import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex justify-center mb-6">
      <Image
        src="/logo/SHO_EL_8ADA_Logo.png"
        alt="Sho El 8ada"
        width={300}
        height={150}
        priority
        className="object-contain"
      />
    </div>
  );
}
