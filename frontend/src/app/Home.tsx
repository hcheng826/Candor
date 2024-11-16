import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/Button/PrimaryButton";
import styled from "@emotion/styled";
import Image from "next/image";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";

export const BgImage = styled.div`
  background-image: url("/town-home.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100vw;
  max-width: 1640px;
  height: 100vh;
  z-index: 0;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.7;
`;

export const BgHouse = styled.div`
  background-image: url("/house.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 300px;
  height: 250px;
  opacity: 0.8;

  position: fixed;
  bottom: 10%;
  left: 55%;
  transform: translateX(-50%);

  &::before {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 0%;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    animation: heartbeat 1.5s infinite;
    animation-delay: 0.5s;
    background-image: url("/heart.svg");
  }
  &::after {
    content: "";
    position: absolute;
    bottom: 90%;
    left: 0%;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    animation: heartbeat 1.5s infinite;
    background-image: url("/heart.svg");
  }

  @keyframes heartbeat {
    0% {
      transform: scale(1) translate(0, 0);
      opacity: 1;
    }
    // 50% { transform: scale(1.2) translate(-10px, -10px); opacity: 0.5 }
    100% {
      transform: scale(1.4) translate(-20px, -20px);
      opacity: 0;
    }
  }
`;

const StyledTitle = styled.h1`
  font-size: 86px;
  line-height: 1;
  color: white;
  margin: 0 16px;

  @media (max-width: 768px) {
    font-size: 48px;
    text-align: center;
  }
`;

const StyledSubtitle = styled.h2`
  font-size: 38px;
  margin: 0;
  line-height: 1;
  color: white;
  margin-top: 8px;
  margin: 0 16px;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 24px;
    text-align: center;
  }
`;

export const Home = () => {
  return (
    <div className="w-full h-full">
      <BgImage />
      <BgHouse />
      <div
        className="z-10 relative flex flex-col justify-center h-[90vh] w-full max-w-[500px] sm:max-w-[88%] mx-auto"
        style={{}}
      >
        <StyledTitle>Candor</StyledTitle>
        <StyledSubtitle>
          rooted in trust & fairness - By the community, for the community
        </StyledSubtitle>

        <div className="flex gap-4 mt-6 flex-wrap justify-center sm:justify-start">
          <Link href="/login?target=dashboard">
            <PrimaryButton className="min-w-[200px] py-6 px-6 text-lg">
              Dashboard
            </PrimaryButton>
          </Link>
          <Link href="/donation-widget">
            <SecondaryButton className="min-w-[200px] py-6 px-6 text-lg">
              Contribute
            </SecondaryButton>
          </Link>
        </div>
      </div>

      <div className="z-10 absolute bottom-0 right-4">
        <div className="relative hidden md:block">
          <Image
            src="/character.svg"
            alt="character speaking"
            width={423}
            height={550}
            style={{
              aspectRatio: "423 / 550",
            }}
          />
          <Image
            src="/chat-bubble.png"
            alt=""
            width={483}
            height={307}
            style={{
              aspectRatio: "483 / 307",
              position: "absolute",
              top: "-20%",
              left: "-72%",
            }}
          />
          <div className="absolute -top-[11%] -left-[61%]">
            <TypeAnimation
              sequence={[
                `Welcome donors, we are candor who has purpose to uplift communities, spread hope, and create lasting change. Let your generosity shine and transform lives—one contribution at a time!`,
                () => {
                  console.log("Sequence completed");
                },
              ]}
              wrapper="span"
              cursor={true}
              repeat={1}
              style={{
                fontSize: "16px",
                display: "inline-block",
                maxWidth: "280px",
              }}
              speed={60}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
