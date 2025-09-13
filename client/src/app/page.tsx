"use client";
import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import bannerImage from "../../public/images/hero-image.webp";
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
import QualityLawyers from "./components/QualityLawyers";
import OurPartners from "./components/OurPartners";

export default function Home() {
  const router = useRouter();
  const role = useAppSelector((state) => state.user?.user?.role);
  console.log(role);

  const roleHrefMap: Record<string, string> = {
    "Super Admin": "/super-admin/add-firm",
    "Firm Admin": "/add-firm",
    Lawyer: "/clients/add",
  };

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen py-20 lg:py-32">
            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left mb-12 lg:mb-0 lg:pr-12">
              <div className="max-w-4xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-8">
                  Uphold Truth For{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                    Justice
                  </span>{" "}
                  With Northman Law Firm
                </h1>
                
                <div className="max-w-2xl mx-auto lg:mx-0">
                  <p className="text-lg sm:text-xl text-slate-300 italic leading-relaxed mb-12">
                    &quot;Easily manage lawyers, assistants, and clients. Keep track
                    of cases, schedules, and billing all from one place.&quot;
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/our-services"
                    className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 font-semibold text-lg rounded-xl transition-all duration-300"
                  >
                    Our Services
                  </Link>
                </div>

                {/* Decorative line */}
                <div className="hidden lg:block w-96 h-px bg-gradient-to-r from-amber-500 to-transparent mt-16"></div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-3xl blur-3xl"></div>
                <Image
                  className="relative z-10 max-w-full h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  src={bannerImage}
                  alt="Professional Legal Services"
                  width={600}
                  height={700}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <OurPartners />

      {/* About Us Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 font-semibold text-sm rounded-full mb-6">
                About Us
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-8">
                Helping To Overcome And Ease The{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                  Legal Burden
                </span>
              </h2>
              
              <div className="prose prose-lg max-w-2xl mx-auto lg:mx-0">
                <p className="text-slate-600 leading-relaxed mb-8">
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
                href="/about-us"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                See Details
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 to-amber-200/50 rounded-3xl blur-2xl"></div>
                <Image 
                  className="relative z-10 max-w-full h-auto rounded-2xl shadow-2xl" 
                  src={maskGroup} 
                  alt="Legal professionals at work"
                  width={500}
                  height={600}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Lawyers Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-800 font-semibold text-sm rounded-full mb-6">
              Our Team
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight max-w-4xl mx-auto">
              Professional Lawyers And Advisors With{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                Extensive Experience
              </span>
            </h2>
          </div>

          {/* Lawyers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { name: "Desy Willy", image: desyLaywer, title: "Senior Business Lawyer" },
              { name: "Lucas Alex", image: lucusLaywer, title: "Senior Business Lawyer" },
              { name: "Nada Geo", image: nadaLaywer, title: "Senior Business Lawyer" },
              { name: "Attorney Will", image: attorneyLaywer, title: "Senior Business Lawyer" },
            ].map((lawyer, index) => (
              <div 
                key={lawyer.name}
                className="group text-center p-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <Image
                    className="relative z-10 w-full max-w-64 h-80 object-cover rounded-2xl mx-auto"
                    src={lawyer.image}
                    alt={`${lawyer.name} - Professional Lawyer`}
                    width={250}
                    height={300}
                  />
                </div>
                <h4 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors duration-300">
                  {lawyer.name}
                </h4>
                <p className="text-slate-600 font-medium">{lawyer.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QualityLawyers />

      {/* Experience Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Image */}
            <div className="flex-1 order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/50 to-yellow-200/50 rounded-3xl blur-2xl"></div>
                <Image
                  className="relative z-10 max-w-full h-auto rounded-2xl shadow-2xl"
                  src={maskGroup2}
                  alt="28 years of legal experience"
                  width={500}
                  height={460}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left order-1 lg:order-2">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                  28 Years
                </span>{" "}
                Has Been A Legal Attorney And Consulting
              </h3>

              <div className="space-y-6">
                {[
                  "Success Handled Cases",
                  "Responsible Raised",
                  "Professional Excellence",
                  "Client Satisfaction"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex-shrink-0">
                      <Image
                        className="w-6 h-6"
                        src={tickSquare}
                        alt="Check mark"
                        width={26}
                        height={26}
                      />
                    </div>
                    <p className="text-lg font-semibold text-slate-800">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 text-center mb-12">
                Get In{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                  Touch
                </span>
              </h2>

              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-slate-800">
                      Full Name
                    </label>
                    <input
                      className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
                      type="text"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-slate-800">
                      Last Name
                    </label>
                    <input
                      className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
                      type="text"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-slate-800">
                      Your Phone
                    </label>
                    <input
                      className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
                      type="tel"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-slate-800">
                      Your Email
                    </label>
                    <input
                      className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
                      type="email"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-slate-800">
                    Message
                  </label>
                  <textarea
                    className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300 h-40 resize-none"
                    placeholder="Enter your message"
                  ></textarea>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-12 py-4 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    Send Message
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}