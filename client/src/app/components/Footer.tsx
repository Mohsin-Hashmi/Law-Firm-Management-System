import footerLogo from "../../../public/images/northman-footer-logo.webp";
import Image from "next/image";
import Link from "next/link";
import instraLogo from "../../../public/images/InstagramLogo01.webp";
import twitterLogo from "../../../public/images/twitterLogo01.webp";
import linkedInLogo from "../../../public/images/linkedinLogo01.webp";
import facebookLogo from "../../../public/images/facebookLogo01.webp";
import phoneLogo from "../../../public/images/callIcon01.webp";
import locationLogo from "../../../public/images/locationLogo01.webp";
import mailLogo from "../../../public/images/mailLogo01.webp";
export default function Footer() {
  return (
    <>
      <footer className="bg-[#172435] py-[40px]">
        <div className="container">
          <Image
            className="m-auto max-w-[200px] pb-[30px]"
            src={footerLogo}
            alt="footer logo"
          />
          <hr className="max-w-[800px] m-auto" />
          <div className="flex justify-between items-start py-[40px] border-b">
            <div className="max-w-[230px] text-[#FFFFFF]">
              <h3 className="text-2xl font-semibold mb-[20px]">About Us</h3>
              <p className="mb-[20px]">
                Lorem ipsum dolor sit amet consectetur. Commodo pulvinar
                molesti.
              </p>
              <div className="flex gap-x-4 items-center">
                <Image src={facebookLogo} alt="facebook logo" />
                <Image src={linkedInLogo} alt="linkedIn logo" />
                <Image src={twitterLogo} alt="twitter logo" />
                <Image src={instraLogo} alt="instra logo" />
              </div>
            </div>
            <div className="text-[#FFFFFF]">
              <h3 className="text-2xl font-semibold mb-[20px]">Services</h3>
              <ol>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">Business Law</Link>
                </li>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">Education Law</Link>
                </li>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">Legal Consultant</Link>
                </li>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">General Lawyer</Link>
                </li>
              </ol>
            </div>
            <div className="text-[#FFFFFF]">
              <h3 className="text-2xl font-semibold mb-[20px]">Page</h3>
              <ol>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">Lawyer</Link>
                </li>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">Appointment</Link>
                </li>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">Documentation</Link>
                </li>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">Cases</Link>
                </li>
                <li className="mb-3hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">News</Link>
                </li>
              </ol>
            </div>

            <div className="text-[#FFFFFF]">
              <h3 className="text-2xl font-semibold mb-[20px]">Links</h3>
              <ol>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">Term of use</Link>
                </li>
                <li className="mb-3 hover:text-gray-300 hover:underline [text-underline-offset:4px]">
                  <Link href="">Privacy Policy</Link>
                </li>
              </ol>
            </div>
            <div className="text-[#FFFFFF]">
              <h3 className="text-2xl font-semibold mb-[20px]">Contact Us</h3>
              <span className="flex items-center gap-x-2 mb-[15px]">
                <Image src={phoneLogo} alt="phone logo"/>
                <p>+22 7272 8282</p>
              </span>
              <span className="flex items-center gap-x-2 mb-[15px]">
                <Image src={locationLogo} alt="location logo"/>
                <p>+7889 Mechanic Rd.Miami, FL 33125</p>
              </span>
              <span className="flex items-center gap-x-2 mb-[15px]">
                <Image src={mailLogo} alt="mail logo"/>
                <p>northmanlaw@domain.com</p>
              </span>
            </div>
          </div>
          <p className="text-center mt-[40px] text-[#FFFFFF]">Copyright @2022 Northman All Right Reserved</p>
        </div>
      </footer>
    </>
  );
}
