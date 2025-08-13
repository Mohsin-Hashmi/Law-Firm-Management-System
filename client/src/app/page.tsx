"use client";
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
import desyLaywer from "../../public/images/desyLawyer.webp";
import lucusLaywer from "../../public/images/lucasLawyer.webp";
import nadaLaywer from "../../public/images/nadaLawyer.webp";
import attorneyLaywer from "../../public/images/attorneyLaywer.webp";
import { useAppSelector } from "./store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Home() {
  const router = useRouter();
  const role = useAppSelector((state) => state.user?.user?.role);
  console.log(role);

  useEffect(() => {
    if (!role) {
      router.push("/auth/login"); // Redirect if no role
    }
  }, [role, router]);

  if (!role) {
    return null; // Avoid rendering anything until redirect happens
  }
  let headingBefore = "";
  const headingAfter = " Law Firm";
  let paragraph = "";

  if (role === "Super Admin") {
    headingBefore = "Manage the Entire Legal Platform with ";
    paragraph =
      "Oversee all law firms, users, and platform-wide operations. Manage subscriptions, review analytics, and keep the system running efficiently.";
  } else if (role === "Firm Admin") {
    headingBefore = "Lead Your Firm to Success with ";
    paragraph =
      "Easily manage lawyers, assistants, and clients. Keep track of cases, schedules, and billing all from one place.";
  } else if (role === "Lawyer") {
    headingBefore = "Uphold Truth For Justice With ";
    paragraph =
      "Empower your law practice with smart tools for case management, client communication, and document handling.";
  }
  const roleHrefMap: Record<string, string> = {
    "Super Admin": "/pages/super-admin/add-firm",
    "Firm Admin": "/lawyers/add",
    Lawyer: "/clients/add",
  };
  return (
    <>
      <section className="bg-[#1E2E45] pb-[100px]">
        <Header />
        <div className="container">
          <div className="flex gap-x-[80px] ">
            <div className="max-w-[800px]">
              <h1 className=" text-[58px] text-white font-semibold">
                {headingBefore}
                <span className="text-[#9A9162]">Northman</span>
                {headingAfter}
              </h1>
            </div>
            <div className="max-w-[400px]">
              <p className="text-[#FFFFFF] text-sm italic ">
                &quot;{paragraph}&quot;
              </p>
            </div>
          </div>
          <hr className=" pb-[60px] w-[400px] block" />
          <Link
            href={role ? roleHrefMap[role] : "#"}
            className="bg-[#9A9162] hover:bg-[#857c54] py-[10px] px-[65px] text-white font-semibold text-xl rounded-md"
          >
            {role === "Super Admin"
              ? "Add Firm"
              : role === "Firm Admin"
              ? "Add Lawyer and Clients"
              : role === "Lawyer"
              ? "Add Clients"
              : ""}
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
              <p className="font-bold mb-[30px] text-[#3A3A38] text-[15px]">
                About Us
              </p>
              <h2 className="text-[45px] font-semibold mb-[40px] text-[#3A3A38]">
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
                className="bg-[#1E2E45] hover:bg-[#2F486C] py-[10px] px-[70px] text-[#FFFFFFFF] text-xl font-semibold rounded-md inline-block"
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
            <p className="text-[#3A3A38] font-bold text-[15px]">Lawyer</p>
            <h2 className="text-[#3A3A38] text-[45px] font-semibold mt-[15px]">
              Professional Lawyers And Advisors With More Experience
            </h2>
          </div>
          <div className="flex items-center justify-around mt-[70px]">
            <span className="text-center">
              <Image
                className="max-w-[250px] h-[300px] object-contain"
                src={desyLaywer}
                alt="desy Laywer"
              />
              <h4 className="font-semibold text-[25px] text-[#3A3A38] mt-[25px]">
                Desy Willy
              </h4>
              <p className="text-[#3A3A38] font-medium">
                Senior Business Lawyer
              </p>
            </span>
            <span className="text-center">
              <Image
                className="max-w-[250px] h-[300px] object-contain"
                src={lucusLaywer}
                alt="lucus Laywer"
              />
              <h4 className="font-semibold text-[25px] text-[#3A3A38] mt-[25px]">
                Lucas Alex
              </h4>
              <p className="text-[#3A3A38] font-medium">
                Senior Business Lawyer
              </p>
            </span>
            <span className="text-center">
              <Image
                className="max-w-[250px] h-[300px] object-contain"
                src={nadaLaywer}
                alt="nada Laywer"
              />
              <h4 className="font-semibold text-[25px] text-[#3A3A38] mt-[25px]">
                Nada Geo
              </h4>
              <p className="text-[#3A3A38] font-medium">
                Senior Business Lawyer
              </p>
            </span>
            <span className="text-center">
              <Image
                className="max-w-[250px] h-[300px] object-contain"
                src={attorneyLaywer}
                alt="nada Laywer"
              />
              <h4 className="font-semibold text-[25px] text-[#3A3A38] mt-[25px]">
                Attorney Will
              </h4>
              <p className="text-[#3A3A38] font-medium">
                Senior Business Lawyer
              </p>
            </span>
          </div>
        </div>
      </section>

      {/* Quality legal lawyer */}
      <section className="bg-[#1E2E45] my-[150px]">
        <div className="container">
          <div className="text-center py-[45px]  text-[#FFFFFF]">
            <h2 className="text-[45px] font-semibold">
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
              className="py-[10px] px-[64px] bg-[#9A9162] hover:bg-[#857c54] mt-[50px] inline-block rounded-md font-semibold"
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
      {/* Contact us section */}
      <section className="mb-[150px]">
        <div className="container">
          <div className="rounded-lg shadow-2xl bg-white  backdrop-blur-md p-6">
            <h2 className="text-[45px] text-[#3A3A38] font-semibold mb-[40px] text-center">
              Get In Touch
            </h2>
            <form action="">
              <div className="flex gap-x-[40px] m-auto justify-center flex-wrap max-w-[900px] gap-y-[30px]">
                <div className="max-w-[370px] flex flex-wrap">
                  <label
                    className="text-[24px] text-[#3A3A38] mb-[15px]"
                    htmlFor=""
                  >
                    Full Name
                  </label>
                  <input
                    className="w-full border border-[#1E2E45] outline-none py-[10px] px-[30px] rounded-md"
                    type="text"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="max-w-[370px] flex flex-wrap">
                  <label
                    className="text-[24px] text-[#3A3A38] mb-[15px]"
                    htmlFor=""
                  >
                    Last Name
                  </label>
                  <input
                    className="w-full border border-[#1E2E45] outline-none py-[10px] px-[30px] rounded-md"
                    type="text"
                    placeholder="Enter last name"
                  />
                </div>
                <div className="max-w-[370px] flex flex-wrap">
                  <label
                    className="text-[24px] text-[#3A3A38] mb-[15px]"
                    htmlFor=""
                  >
                    Your Phone
                  </label>
                  <input
                    className="w-full border border-[#1E2E45] outline-none py-[10px] px-[30px] rounded-md"
                    type="tel"
                    placeholder="Enter your phone"
                  />
                </div>
                <div className="max-w-[370px] flex flex-wrap">
                  <label
                    className="text-[24px] text-[#3A3A38] mb-[15px]"
                    htmlFor=""
                  >
                    Your Email
                  </label>
                  <input
                    className="w-full border border-[#1E2E45] outline-none py-[10px] px-[30px] rounded-md"
                    type="email"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="w-[770px] flex flex-wrap">
                  <label
                    className="text-[24px] text-[#3A3A38] mb-[15px]"
                    htmlFor=""
                  >
                    Message
                  </label>
                  <textarea
                    className="w-full border border-[#1E2E45] outline-none py-[10px] px-[30px] rounded-md p-[25px] h-[200px]"
                    placeholder="Enter message"
                  />
                </div>
                <Link
                  href=""
                  className="bg-[#1E2E45] hover:bg-[#2F486C] py-[10px] px-[70px] text-[#FFFFFFFF] text-xl font-semibold rounded-md  float-left"
                >
                  Send Message
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
