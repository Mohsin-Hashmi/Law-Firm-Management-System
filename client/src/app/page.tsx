import Image from "next/image";
import Header from "./components/Header";
import Link from "next/link";
import bannerImage from "../../public/images/hero-image.webp";
export default function Home() {
  return (
    <>
      <div className="bg-[#1E2E45] pb-[100px]">
        <Header />
        <section className="container">
          <div className="flex gap-x-[80px] ">
            <div className="max-w-[800px]">
              <h1 className=" text-[60px] text-white font-semibold">
                Uphold truth for justice With{" "}
                <span className="text-[#9A9162]">Northman</span> Law Firm{" "}
              </h1>
            </div>
            <div className="max-w-[400px]">
              <p className="text-[#FFFFFF] text-sm">
                Empower your law firm with our smart management solution.
                Streamline case tracking, client communication, appointments,
                billing, and document handling — all in one secure platform
                built for legal professionals.
              </p>
            </div>
          </div>
          <hr className=" pb-[60px] w-[400px] block" />
          <Link
            href=""
            className="bg-[#9A9162] py-[10px] px-[65px] text-white font-semibold"
          >
            Get Started
          </Link>
          <Image
            className="z-50 absolute max-w-[500px] right-[30px] top-[350px]"
            src={bannerImage}
            alt="banner image"
          />
        </section>
      </div>

      <section>
        <div className="container">
          <h1 className="mt-[150px] text-center text-[#3A3A38] text-[40px] font-semibold">Our Partnership</h1>

        </div>
      </section>
    </>
  );
}
