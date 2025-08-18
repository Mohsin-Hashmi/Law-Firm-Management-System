"use client";
import { useAppSelector } from "@/app/store/hooks";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

import Image from "next/image";
import wellcomeMessageImg from "../../../../public/images/wellcomeMessage.webp";
import QualityLawyers from "@/app/components/QualityLawyers";
import successStoryImg from "../../../../public/images/successStoryImg.webp";
import successStortImg02 from "../../../../public/images/successStoryImg02.webp";
import AboutUs from "@/app/components/AboutUs";
export default function AboutSection() {
  const role = useAppSelector((state) => state.user.user?.role);
  console.log("role is about us page", role);

  const aboutTexts: Record<string, string> = {
    "Super Admin":
      "Oversee the entire platform with complete control, managing firms, users, and operations.",
    "Firm Admin":
      "Manage your firm's lawyers, clients, and cases with ease and efficiency.",
    Lawyer:
      "Deliver excellent legal services while keeping case details organized and up to date.",
    Assistant:
      "Support lawyers and administrators by managing schedules, documents, and client communication.",
  };

  return (
    <>
      <Header />
      <section>
        <div className="container">
           <div className="my-[70px] flex justify-between items-center gap-8">
            <h2 className="text-7xl font-semibold  pr-8 border-r-2 border-gray-300">
              About Us
            </h2>
            <p className="w-[700px] text-base pl-8">
              {role ? aboutTexts[role] : "Welcome to our platform."}
            </p>
          </div>
          <AboutUs />
        </div>
      </section>
      {/* our partnes swiper must add */}

      <section className="text-[#3A3A38]">
        <div className="container">
          <div className="flex items-center justify-between gap-x-[50px] w-full">
            <Image
              className="min-w-[350px] min-h-[300px] object-contain"
              src={wellcomeMessageImg}
              alt="welcome image"
            />
            <span>
              <p className="mb-2">Welcome Message</p>
              <h2 className="text-5xl font-semibold">
                Hello People, Welcome To Northman
              </h2>
            </span>
          </div>

          <div className="mt-[60px] text-base leading-relaxed">
            <p className="mb-4">
              At Northman, we are dedicated to providing exceptional legal
              support and solutions for all your needs. Our platform connects
              clients with top-notch legal professionals, making it easier than
              ever to manage cases, access resources, and stay informed. We
              believe in a client- first approach to ensure efficiency,
              transparency, and trust.
            </p>
            <p>
              Our mission is to simplify the legal process and empower both
              clients and legal teams with modern tools and reliable guidance.
              Whether you are a firm, lawyer, or assistant, Northman offers a
              seamless experience designed to save time, reduce stress, and
              achieve better outcomes in every legal matter.
            </p>
          </div>
        </div>
      </section>

      <QualityLawyers />
      {/* Our vision Our mission */}
      <section className="text-[#3A3A38] mb-[100px]">
        <div className="container">
          <div className="flex justify-around items-center">
            <div className="max-w-[400px]">
              <h2 className="flex items-center gap-3 mb-[40px] font-semibold text-5xl">
                <span className="block w-10 h-[3px] bg-[#3A3A38]"></span>
                Our Vision
              </h2>
              <p className="text-base mb-[20px]">
                We envision a future where law firms can operate with complete
                efficiency, free from administrative burdens and operational
                bottlenecks. Our platform empowers legal professionals with the
                tools they need to manage cases, documents, and clients
                effortlessly.
              </p>
              <p>
                By integrating advanced technology with user-friendly design, we
                aim to set the standard for law firm management—enabling firms
                to focus on delivering justice while we streamline the process
                behind the scenes.
              </p>
            </div>
            <div className="max-w-[400px]">
              <h2 className="flex items-center gap-3 mb-[40px] font-semibold text-5xl">
                <span className="block w-10 h-[3px] bg-[#3A3A38]"></span>
                Our Mission
              </h2>
              <p className="text-base mb-[20px]">
                Our mission is to simplify and modernize legal practice
                management through innovation. We provide secure, reliable, and
                intuitive solutions that optimize workflows, improve
                collaboration, and ensure compliance.
              </p>
              <p>
                We are committed to helping law firms of all sizes work smarter,
                not harder—transforming daily operations into a seamless
                experience that delivers measurable results for both legal teams
                and their clients.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Success Story */}
      <section className="mb-[100px]">
        <div className="container">
          <div className="relative w-full">
            {/* Background Image */}
            <Image
              src={successStoryImg}
              alt="success story"
              className="w-full h-[500px] object-cover"
            />

            {/* Optional Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

            {/* Text Overlay - Right Side */}
            <span className="absolute inset-0 flex flex-col justify-center items-end text-right text-white px-8">
              <p className="text-lg mb-2">Success Story</p>
              <h2 className="text-2xl md:text-4xl font-bold max-w-md">
                The Best Award has been given to Northman Legal Lawyer
                International
              </h2>
            </span>
          </div>
          <div className="flex justify-between items-center mt-[50px]">
            <span className="max-w-[700px] text-[#3A3A38] text-sm">
              <p className="mb-[40px]">
                At Northman Legal, our commitment to excellence has been
                recognized on a global stage. Through the use of our innovative
                Law Firm Management System, our legal team streamlined
                operations, reduced case handling time, and improved client
                communication by over 40%. This transformation allowed our
                lawyers to dedicate more time to building stronger client
                relationships and delivering winning results.
              </p>
              <p>
                This achievement has not only enhanced our operational
                efficiency but also set a benchmark for law firms worldwide.
                Being honored with the Best Award reflects our dedication to
                innovation, professionalism, and client satisfaction. We will
                continue to lead the way in redefining how modern law firms
                operate through technology-driven solutions.
              </p>
            </span>
            <Image
              className="max-w-[300px] min-h-[300px] rounded-full"
              src={successStortImg02}
              alt="success story image"
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
