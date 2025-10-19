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
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full overflow-x-hidden">
        <section className="w-full">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="my-12 md:my-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold md:pr-8 md:border-r-2 border-gray-300 break-words">
                About Us
              </h2>
              <p className="w-full md:max-w-[700px] text-sm sm:text-base md:pl-8 leading-relaxed">
                {role ? aboutTexts[role] : "Welcome to our platform."}
              </p>
            </div>
            <AboutUs />
          </div>
        </section>

        {/* Welcome Message Section */}
        <section className="text-[#3A3A38] py-12 sm:py-16 w-full">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 w-full">
              <Image
                className="w-full max-w-[350px] h-auto object-contain"
                src={wellcomeMessageImg}
                alt="welcome image"
              />
              <div className="flex-1 text-center lg:text-left">
                <p className="mb-2 text-sm sm:text-base">Welcome Message</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold break-words">
                  Hello People, Welcome To Northman
                </h2>
              </div>
            </div>

            <div className="mt-12 md:mt-16 text-sm sm:text-base leading-relaxed text-justify">
              <p className="mb-4">
                At Northman, we are dedicated to providing exceptional legal
                support and solutions for all your needs. Our platform connects
                clients with top-notch legal professionals, making it easier than
                ever to manage cases, access resources, and stay informed. We
                believe in a client-first approach to ensure efficiency,
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

        {/* Vision and Mission Section */}
        <section className="text-[#3A3A38] py-12 sm:py-16 lg:py-20 w-full">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-around items-start gap-12 lg:gap-8">
              <div className="w-full lg:max-w-[450px]">
                <h2 className="flex items-center gap-3 mb-8 lg:mb-10 font-semibold text-3xl sm:text-4xl lg:text-5xl">
                  <span className="block w-8 sm:w-10 h-[3px] bg-[#3A3A38] flex-shrink-0"></span>
                  Our Vision
                </h2>
                <p className="text-sm sm:text-base mb-5 text-justify leading-relaxed">
                  We envision a future where law firms can operate with complete
                  efficiency, free from administrative burdens and operational
                  bottlenecks. Our platform empowers legal professionals with the
                  tools they need to manage cases, documents, and clients
                  effortlessly.
                </p>
                <p className="text-sm sm:text-base text-justify leading-relaxed">
                  By integrating advanced technology with user-friendly design, we
                  aim to set the standard for law firm management—enabling firms
                  to focus on delivering justice while we streamline the process
                  behind the scenes.
                </p>
              </div>
              
              <div className="w-full lg:max-w-[450px]">
                <h2 className="flex items-center gap-3 mb-8 lg:mb-10 font-semibold text-3xl sm:text-4xl lg:text-5xl">
                  <span className="block w-8 sm:w-10 h-[3px] bg-[#3A3A38] flex-shrink-0"></span>
                  Our Mission
                </h2>
                <p className="text-sm sm:text-base mb-5 text-justify leading-relaxed">
                  Our mission is to simplify and modernize legal practice
                  management through innovation. We provide secure, reliable, and
                  intuitive solutions that optimize workflows, improve
                  collaboration, and ensure compliance.
                </p>
                <p className="text-sm sm:text-base text-justify leading-relaxed">
                  We are committed to helping law firms of all sizes work smarter,
                  not harder—transforming daily operations into a seamless
                  experience that delivers measurable results for both legal teams
                  and their clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Success Story Section */}
        <section className="py-12 sm:py-16 w-full">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="relative w-full">
              {/* Background Image */}
              <Image
                src={successStoryImg}
                alt="success story"
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover rounded-lg"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>

              {/* Text Overlay */}
              <div className="absolute inset-0 flex flex-col justify-center items-start sm:items-end text-left sm:text-right text-white px-6 sm:px-8 lg:px-12">
                <p className="text-base sm:text-lg mb-2">Success Story</p>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-md break-words">
                  The Best Award has been given to Northman Legal Lawyer
                  International
                </h2>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12 mt-12 lg:mt-16">
              <div className="w-full lg:max-w-[700px] text-[#3A3A38] text-sm sm:text-base order-2 lg:order-1">
                <p className="mb-8 text-justify leading-relaxed">
                  At Northman Legal, our commitment to excellence has been
                  recognized on a global stage. Through the use of our innovative
                  Law Firm Management System, our legal team streamlined
                  operations, reduced case handling time, and improved client
                  communication by over 40%. This transformation allowed our
                  lawyers to dedicate more time to building stronger client
                  relationships and delivering winning results.
                </p>
                <p className="text-justify leading-relaxed">
                  This achievement has not only enhanced our operational
                  efficiency but also set a benchmark for law firms worldwide.
                  Being honored with the Best Award reflects our dedication to
                  innovation, professionalism, and client satisfaction. We will
                  continue to lead the way in redefining how modern law firms
                  operate through technology-driven solutions.
                </p>
              </div>
              
              <Image
                className="w-full max-w-[250px] sm:max-w-[300px] h-auto aspect-square rounded-full object-cover order-1 lg:order-2"
                src={successStortImg02}
                alt="success story image"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}