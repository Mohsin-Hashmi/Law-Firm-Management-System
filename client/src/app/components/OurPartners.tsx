
import Image from "next/image";
import partner01 from "../../../public/images/dearazoLogo.webp";
import partner02 from "../../../public/images/miguxianLogo.webp";
import partner03 from "../../../public/images/jeninaylnLogo.webp";
import partner04 from "../../../public/images/superanzoLogo.webp";
export default function OurPartners() {
  return (
    <>
      <section className="py-[64px] sm:py-[100px]">
        <div className="container">
          <h1 className="text-center text-[#3A3A38] text-3xl sm:text-4xl lg:text-5xl font-semibold">
            Our Partnership
          </h1>

          <div className="mt-[32px] sm:mt-[50px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-8 items-center w-fit">
            <Image src={partner01} alt="partner 01" />
            <Image src={partner02} alt="partner 02" />
            <Image src={partner03} alt="partner 03" />
            <Image src={partner04} alt="partner 04" />
          </div>
        </div>
      </section>
    </>
  )
}