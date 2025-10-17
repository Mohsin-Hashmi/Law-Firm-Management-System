
import Image from "next/image";
import partner01 from "../../../public/images/dearazoLogo.webp";
import partner02 from "../../../public/images/miguxianLogo.webp";
import partner03 from "../../../public/images/jeninaylnLogo.webp";
import partner04 from "../../../public/images/superanzoLogo.webp";
export default function OurPartners(){
    return(
        <>
         <section className="py-[64px] sm:py-[100px]">
        <div className="container">
          <h1 className=" text-center text-[#3A3A38] text-[28px] sm:text-[40px] font-semibold">
            Our Partnership
          </h1>
          <div className="mt-[32px] sm:mt-[50px] grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 items-center">
            <Image className="mx-auto h-10 sm:h-12 w-auto" src={partner01} alt="partner 01" />
            <Image className="mx-auto h-10 sm:h-12 w-auto" src={partner02} alt="partner 02" />
            <Image className="mx-auto h-10 sm:h-12 w-auto" src={partner03} alt="partner 03" />
            <Image className="mx-auto h-10 sm:h-12 w-auto" src={partner04} alt="partner 04" />
          </div>
        </div>
      </section>
        </>
    )
}