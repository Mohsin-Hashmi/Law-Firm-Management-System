import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import bannerImage from "../../public/images/hero-image.webp";
import partner01 from "../../public/images/dearazoLogo.webp";
import partner02 from "../../public/images/miguxianLogo.webp";
import partner03 from "../../public/images/jeninaylnLogo.webp";
import partner04 from "../../public/images/superanzoLogo.webp";
import maskGroup from "../../public/images/maskGroup.webp";
export default function Home() {
  return (
    <>
      <section className="bg-[#1E2E45] pb-[100px]">
        <Header />
        <div className="container">
          <div className="flex gap-x-[80px] ">
            <div className="max-w-[800px]">
              <h1 className=" text-[58px] text-white font-semibold">
                Uphold Truth For Justice With{" "}
                <span className="text-[#9A9162]">Northman</span> Law Firm{" "}
              </h1>
            </div>
            <div className="max-w-[400px]">
              <p className="text-[#FFFFFF] text-sm italic ">
                &quot;Empower your law firm with our smart management solution.
                Streamline case tracking, client communication, appointments,
                billing, and document handling — all in one secure platform
                built for legal professionals.&quot;
              </p>
            </div>
          </div>
          <hr className=" pb-[60px] w-[400px] block" />
          <Link
            href=""
            className="bg-[#9A9162] py-[10px] px-[65px] text-white font-semibold text-xl"
          >
            Get Started
          </Link>
          <Image
            className="z-50 absolute max-w-[500px] right-[30px] top-[350px]"
            src={bannerImage}
            alt="banner image"
          />
        </div>
      </section>
      {/* Our Partner Section */}
      <section className="py-[150px]">
        <div className="container">
          <h1 className=" text-center text-[#3A3A38] text-[40px] font-semibold">
            Our Partnership
          </h1>
          <div className="flex items-center justify-around mt-[50px]">
            <Image src={partner01} alt="partner 01" />
            <Image src={partner02} alt="partner 02" />
            <Image src={partner03} alt="partner 03" />
            <Image src={partner04} alt="partner 04" />
          </div>
        </div>
      </section>
      {/* Aboutus  Section */}

      <section className="pb-[150px]">
        <div className="container">
          <div className="flex gap-x-[69px] items-center">
            <div className="max-w-[600px]">
              <p className="font-bold mb-[30px]">About Us</p>
              <h2 className="text-[45px] font-bold mb-[40px]">
                Helping To Overcome And Ease The Legal Burden
              </h2>
              <div className="max-w-[420px]">
                <p className="text-[#3A3A38] text-justify mb-[40px]">
                  Lorem ipsum dolor sit amet consectetur. Commodo pulvinar
                  molestie pellentesque urna libero velit porta. Velit
                  pellentesque hac gravida pellentesque est semper. Duis lectus
                  gravida ultricies eleifend in pharetra faucibus orci sem.
                  Proin ac a cursus praesent.{" "}
                </p>
              </div>
              <Link
                href=""
                className="bg-[#1E2E45] py-[10px] px-[70px] text-[#FFFFFFFF] text-xl font-semibold"
              >
                See detail
              </Link>
            </div>
            <Image className="max-w-[500px]" src={maskGroup} alt="mask group" />
          </div>
        </div>
      </section>
      {/* professtional services   Section pending*/}

      {/* professional lawyers */}
      <section>
        <div className="container">
          <div className="text-center">
            <p>Lawyer</p>
            <h2>Professional lawyers and advisors with more experience</h2>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
