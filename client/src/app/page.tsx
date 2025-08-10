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
import maskGroup2 from "../../public/images/formImage.webp";
import tickSquare from "../../public/images/tickSquare.webp";
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
            className="bg-[#9A9162] py-[10px] px-[65px] text-white font-semibold text-xl rounded-md"
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
              <p className="font-bold mb-[30px] text-[#3A3A38]">About Us</p>
              <h2 className="text-[45px] font-bold mb-[40px] text-[#3A3A38]">
                Helping To Overcome And Ease The Legal Burden
              </h2>
              <div className="max-w-[420px]">
                <p className="text-[#3A3A38] text-justify mb-[40px] ">
                  We are committed to empowering legal professionals with the
                  tools they need to manage their practice more efficiently.
                  From organizing case files and tracking court dates to
                  managing client communications and billing, our platform is
                  designed to reduce administrative work and help you focus on
                  what truly matters — delivering justice and exceptional legal
                  services.
                </p>
              </div>
              <Link
                href=""
                className="bg-[#1E2E45] py-[10px] px-[70px] text-[#FFFFFFFF] text-xl font-semibold rounded-md inline-block"
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

      {/* Quality legal lawyer */}
      <section className="bg-[#1E2E45] my-[150px]">
        <div className="container">
          <div className="text-center py-[45px]  text-[#FFFFFF]">
            <h2 className="text-[45px] font-bold">
              We Help You With Quality Legal Lawyer
            </h2>
            <p className="text-sm mt-[20px]">
              Our platform simplifies the way law firms operate by centralizing
              client records, case management, scheduling, and billing in one
              secure space. Designed for both solo lawyers and large firms, it
              helps you stay organized, save time, and focus on delivering
              exceptional legal services to your clients.
            </p>
            <Link
              href=""
              className="py-[10px] px-[64px] bg-[#9A9162] mt-[50px] inline-block rounded-md font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
      {/* Our experinces */}
      <section className="pb-[150px]">
        <div className="container">
          <div className="flex items-center gap-x-[70px] justify-between">
            <Image
              className="max-w-[500px] max-h-[460px] "
              src={maskGroup2}
              alt="mask group 2"
            />
            <div className="">
              <h3 className="text-[44px] font-semibold text-[#3A3A38]">
                28 Years Has Been A Legal Attorney And Consulting
              </h3>
              <div className=" text-lg font-semibold text-[#3A3A38] mt-[30px]">
                <span className="flex items-center gap-x-4 mb-[15px]">
                  <Image
                    className="w-[26px] h-[26px]"
                    src={tickSquare}
                    alt="tick square"
                  />
                  <p>Success Handled Cases</p>
                </span>
                <span className="flex items-center gap-x-4 mb-[15px]">
                  <Image
                    className="w-[26px] h-[26px]"
                    src={tickSquare}
                    alt="tick square"
                  />
                  <p>Responsible Raised</p>
                </span>
                <span className="flex items-center gap-x-4 mb-[15px]">
                  <Image
                    className="w-[26px] h-[26px]"
                    src={tickSquare}
                    alt="tick square"
                  />
                  <p>Success Handled Cases</p>
                </span>
                <span className="flex items-center gap-x-4 mb-[15px]">
                  <Image
                    className="w-[26px] h-[26px]"
                    src={tickSquare}
                    alt="tick square"
                  />
                  <p>Responsible Raised</p>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
