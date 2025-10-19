"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useAppSelector } from "@/app/store/hooks";
import Image from "next/image";
import wellcomeMessageImg from "../../../../public/images/wellcomeMessage.webp";
import maskGroupImg from "../../../../public/images/maskGroup.webp";
import successStoryImg from "../../../../public/images/successStoryImg.webp";

export default function OurServices() {
  const role = useAppSelector((state) => state.user.user?.role);

  const services = [
    {
      title: "Business Law",
      image: wellcomeMessageImg,
      subServices: [
        "Corporate Formation",
        "Contract Drafting",
        "Mergers & Acquisitions",
        "Intellectual Property",
        "Employment Law",
      ],
    },
    {
      title: "Education Law",
      image: maskGroupImg,
      subServices: [
        "Student Rights",
        "School Policies",
        "Special Education",
        "Academic Disputes",
        "Compliance & Regulations",
      ],
    },
    {
      title: "Legal Consultant",
      image: successStoryImg,
      subServices: [
        "Legal Advice",
        "Risk Assessment",
        "Compliance Consulting",
        "Policy Development",
        "Strategic Planning",
      ],
    },
    {
      title: "General Lawyer",
      image: wellcomeMessageImg,
      subServices: [
        "Civil Litigation",
        "Criminal Defense",
        "Family Law",
        "Estate Planning",
        "Real Estate Law",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full overflow-x-hidden">
        <section className="text-[#3A3A38] px-4 sm:px-6 lg:px-10 w-full">
          <div className="max-w-[90rem] mx-auto w-full">
            <div className="my-12 md:my-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold md:pr-8 md:border-r-2 border-gray-300 break-words">
                Services
              </h2>

              <p className="w-full md:max-w-[700px] text-sm sm:text-base md:pl-8 pt-2 md:pt-0 leading-relaxed text-gray-700 text-justify">
                Discover our comprehensive range of legal services designed to
                meet the diverse needs of our clients. From business law to
                education law, our expert team provides tailored solutions to
                ensure your legal matters are handled with precision and care.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-gray-50 w-full">
          <div className="max-w-[90rem] mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <Image
                    src={service.image}
                    alt={service.title}
                    className="w-full h-44 sm:h-48 md:h-52 object-cover"
                  />
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#3A3A38]">
                      {service.title}
                    </h3>
                    <ul className="space-y-2">
                      {service.subServices.map((subService, subIndex) => (
                        <li
                          key={subIndex}
                          className="text-sm text-gray-600 flex items-center"
                        >
                          <span className="w-2 h-2 bg-[#9A9162] rounded-full mr-3 flex-shrink-0"></span>
                          {subService}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}