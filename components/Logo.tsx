import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex justify-center -mt-10 -mb-20">
      <Image
        src="/logo/SHO_EL_8ADA_Logo.png"
        alt="Sho El 8ada"
        width={400}
        height={200}
        priority
        className="object-contain"
      />
    </div>
  );
}
