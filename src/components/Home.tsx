"use client";

import type React from "react";
import { useRef, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import axios from "../api/axiosInstance";
import {
  Mail,
  Phone,
  MapPin,
  Lightbulb,
  Users,
  ShieldCheck,
  Sparkles,
  Rocket,
  Link,
} from "lucide-react";

// Define component props interfaces
interface CardProps {
  className?: string;
  children: React.ReactNode;
}
interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}
interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

// Card components
const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`rounded-lg shadow-lg ${className}`}>{children}</div>
);
const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <h3 className={`text-2xl font-bold ${className}`}>{children}</h3>
);
const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={`text-sm ${className}`}>{children}</div>
);

// Input component
const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff4d4d] ${className}`}
    {...props}
  />
);

// Button component
const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-[#ff4d4d] ${className}`}
    {...props}
  >
    {children}
  </button>
);

// type UserType = "user" | "admin" | "organizer";

const Home = () => {
  const aboutRef = useRef<any>(null);
  const contactRef = useRef<HTMLElement>(null);
  const [formView, setFormView] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirectToDashboard = () => {
    const path = "/user/dashboard";
    setTimeout(() => {
      // In a real app, you'd use Next.js router
      console.log(`Redirecting to ${path}`);
      // router.push(path);
    }, 1500);
  };

  const handleRegisterClick = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/auth/signup", { email, password });
      alert("Registration successful!");
      setFormView("login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post("/auth/login", { email, password });
      const bearer = (res as any).headers?.authorization;
      if (bearer) {
        axios.defaults.headers.common["Authorization"] = bearer;
      }
      alert("Login successful!");
      redirectToDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (ref: React.RefObject<any>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between bg-[#1a2b6b] text-white">
        <a href="#" className="flex items-center justify-center">
          <span className="sr-only">Spot My Event</span>
        </a>
        <nav className="flex gap-4 sm:gap-6">
          <button
            className="text-sm font-medium hover:underline underline-offset-4"
            onClick={() => scrollToSection(aboutRef)}
          >
            About Us
          </button>
          <a
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Our Mission
          </a>
          <button
            className="text-sm font-medium hover:underline underline-offset-4"
            onClick={() => scrollToSection(contactRef)}
          >
            Contact Us
          </button>
          <a
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            English
          </a>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-[#1a2b6b] to-[#4a39a3] text-white relative overflow-hidden">
          <div className="container px-4 md:px-6 grid lg:grid-cols-2 gap-8 items-center relative z-10 mx-auto max-w-7xl">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2 text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl/none">
                Spot My
                <span className="relative inline-block">
                  Ev<span className="text-[#ff4d4d] relative">e</span>nt
                  <MapPin className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[#ff4d4d] w-12 h-12" />
                </span>
              </div>
              <Card className="bg-white/10 border-none text-white p-6 rounded-lg max-w-md mt-8 backdrop-blur-sm">
                <CardTitle className="text-2xl font-bold mb-4">
                  What We Do
                </CardTitle>
                <CardContent className="text-sm p-0">
                  We provide a user-friendly and comprehensive platform
                  dedicated to the event industry. Our platform simplifies the
                  process of finding, creating, and managing events of all
                  types. Whether you're a professional event planner, a small
                  business owner, or an individual looking to organize a
                  gathering, Spot My Event provides the tools and features you
                  need to make your event a success. From ticketing and
                  registration to promotion and attendee management, we've got
                  you covered.
                </CardContent>
              </Card>
            </div>

            {/* Dynamic Form Card */}
            <Card className="bg-white/10 border-none text-white p-8 rounded-lg max-w-lg mx-auto backdrop-blur-sm w-full">
              {formView === "register" && (
                <>
                  <CardTitle className="text-3xl font-bold mb-6 text-center">
                    Register
                  </CardTitle>
                  <CardContent className="grid gap-4 p-0">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/20 border border-white/30 text-white placeholder:text-white/70"
                    />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white/20 border border-white/30 text-white placeholder:text-white/70"
                    />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password (admin123 for Admin, organizer123 for Organizer)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/20 border border-white/30 text-white placeholder:text-white/70"
                    />
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/20 border border-white/30 text-white placeholder:text-white/70"
                    />
                    <Button
                      className="w-full bg-white text-[#1a2b6b] hover:bg-gray-100 font-semibold"
                      onClick={handleRegisterClick}
                      disabled={isLoading}
                    >
                      {isLoading ? "Registering..." : "Register"}
                    </Button>
                    <div className="text-center text-sm mt-4">
                      Already have an account?{" "}
                      <button
                        onClick={() => setFormView("login")}
                        className="text-[#ff4d4d] hover:underline"
                      >
                        Sign In
                      </button>
                    </div>
                  </CardContent>
                </>
              )}

              {formView === "login" && (
                <>
                  <CardTitle className="text-3xl font-bold mb-6 text-center">
                    Sign In
                  </CardTitle>
                  <CardContent className="grid gap-4 p-0">
                    <Input
                      id="login-email"
                      name="loginEmail"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/20 border border-white/30 text-white placeholder:text-white/70"
                    />
                    <Input
                      id="login-password"
                      name="loginPassword"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/20 border border-white/30 text-white placeholder:text-white/70"
                    />
                    <Button
                      className="w-full bg-white text-[#1a2b6b] hover:bg-gray-100 font-semibold"
                      onClick={handleLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                    <div className="text-center text-sm mt-4">
                      {"Don't have an account? "}
                      <button
                        onClick={() => setFormView("register")}
                        className="text-[#ff4d4d] hover:underline"
                      >
                        Register
                      </button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 text-center mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#1a2b6b] mb-12">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-4">
                <Lightbulb className="w-12 h-12 text-[#ff4d4d] mb-4" />
                <h3 className="text-xl font-semibold text-[#1a2b6b] mb-2">
                  Innovation Hub
                </h3>
                <p className="text-gray-600 text-sm">
                  We are constantly exploring new technologies and features to
                  enhance your event experience.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Users className="w-12 h-12 text-[#ff4d4d] mb-4" />
                <h3 className="text-xl font-semibold text-[#1a2b6b] mb-2">
                  User-centric design
                </h3>
                <p className="text-gray-600 text-sm">
                  Our platform is built with your needs in mind, ensuring a
                  seamless and intuitive experience.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <ShieldCheck className="w-12 h-12 text-[#ff4d4d] mb-4" />
                <h3 className="text-xl font-semibold text-[#1a2b6b] mb-2">
                  Transparency
                </h3>
                <p className="text-gray-600 text-sm">
                  We believe in clear communication and honest practices in all
                  our operations.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Sparkles className="w-12 h-12 text-[#ff4d4d] mb-4" />
                <h3 className="text-xl font-semibold text-[#1a2b6b] mb-2">
                  Community Focus
                </h3>
                <p className="text-gray-600 text-sm">
                  We foster a vibrant community where event organizers and
                  attendees can connect and thrive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Us / Our Story Section */}
        <div
          className="flex items-center justify-center min-h-screen bg-gray-50"
          ref={aboutRef}
        >
          <section className="w-full py-12 bg-gray-100 overflow-hidden min-h-[700px] flex items-center justify-center">
            <div
              className="max-w-7xl mx-auto w-full h-full flex flex-col items-center justify-center gap-y-8 gap-x-0 px-4 sm:px-6 lg:px-8
    lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:h-[550px] lg:items-center lg:justify-items-center lg:gap-y-0"
            >
              {/* About Us Card - top left on large screens, top on small */}
              <Card
                className="bg-[#1a2b6b] text-white p-6 rounded-sm max-w-xs sm:max-w-sm lg:max-w-md z-10 shadow-lg
                         lg:col-start-1 lg:row-start-1 lg:justify-self-start lg:self-start"
              >
                <CardTitle className="text-2xl font-bold mb-4">
                  About Us
                </CardTitle>
                <CardContent className="text-sm p-0">
                  Introducing "Spot My Event", your ultimate destination for
                  seamless event management! At "Spot My Event", we believe that
                  every gathering, big or small, deserves to be a memorable
                  experience. Our platform is designed to empower you with the
                  tools and resources to effortlessly plan, promote, and execute
                  your events.
                </CardContent>
              </Card>

              {/* Title - center */}
              <div
                className="p-6 text-center text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-white z-20 bg-[#1a2b6b] shadow-xl
                          lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center lg:justify-self-center"
              >
                Spot My
                <br />
                <span className="relative inline-block">
                  Ev<span className="text-[#ff4d4d] relative">e</span>nt
                </span>
              </div>

              {/* Our Story Card - bottom right on large screens, bottom on small */}
              <Card
                className="bg-[#1a2b6b] text-white p-6 max-w-xs sm:max-w-sm lg:max-w-md z-10 shadow-lg rounded-sm
                         lg:col-start-3 lg:row-start-2 lg:justify-self-end lg:self-end"
              >
                <CardTitle className="text-2xl font-bold mb-4">
                  Our Story
                </CardTitle>
                <CardContent className="text-sm p-0">
                  Founded by a team of passionate event enthusiasts, "Spot My
                  Event" began with a simple yet powerful vision: to simplify
                  event planning for everyone. We noticed the challenges
                  individuals and organizations faced when organizing events,
                  from managing registrations to coordinating logistics. From
                  this insight, we set out to create a comprehensive,
                  user-friendly platform that would streamline the entire event
                  lifecycle.
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* Our Mission Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 text-center mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#1a2b6b] mb-12">
              Our Mission
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-[#1a2b6b] text-white p-6 rounded-lg flex flex-col items-center text-center shadow-lg">
                <Rocket className="w-12 h-12 text-white mb-4" />
                <CardContent className="text-base p-0 leading-relaxed font-medium">
                  We aim to provide a global event management platform for a
                  simple and innovative experience.
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 text-[#1a2b6b] p-6 rounded-lg flex flex-col items-center text-center shadow-lg">
                <Lightbulb className="w-12 h-12 text-[#1a2b6b] mb-4" />
                <CardContent className="text-base p-0 leading-relaxed font-medium">
                  To revolutionize the event industry by offering cutting-edge
                  solutions, accessibility, and technological excellence for
                  everyone. We are dedicated to building a professional and
                  reliable platform.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-800 text-white relative overflow-hidden">
          <img
            src="./image.png"
            alt="Office workspace background"
            className="absolute inset-0 opacity-30 object-cover w-full h-full"
            width={1200}
            height={800}
          />
          <div className="container px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 mx-auto max-w-7xl">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl lg:text-5xl mb-4">
                JOIN US
              </h2>
              <p className="text-lg md:text-xl">
                Join our team and contribute to revolutionizing the event
                industry. We are looking for passionate individuals to join our
                dynamic team. If you are a motivated and talented professional
                looking for a challenging and rewarding career, we invite you to
                explore our opportunities. {"Let's build something great!"}
              </p>
            </div>
            <Button className="bg-white text-[#1a2b6b] hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
              Learn More
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="bg-[#1a2b6b] text-white py-8 px-4 md:px-6"
        ref={contactRef}
      >
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto max-w-7xl">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">CONTACT US AT :</h3>
            <p className="text-sm">
              <span className="font-semibold">PHONE:</span>{" "}
              {"+ 91 8147563285, +91 9964876361"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">EMAIL:</span>{" "}
              {"ruchi.mys@gmail.com, mahimnmyso@gmail.com"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">ADDRESS:</span>{" "}
              {"Sharavi Tech India LLP"}
              <br />
              {"No.156, D No . 520/2, 1st Floor,"}
              <br />
              {"Lokanayakanagar , Metagalli, Mysore -570016"}
              <br />
              {"Karnataka, India"}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-gray-300">
                <FaFacebook className="w-6 h-6" />{" "}
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <FaTwitter className="w-6 h-6" />{" "}
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <FaInstagram className="w-6 h-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <FaLinkedin className="w-6 h-6" />{" "}
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm mt-8">
          © {new Date().getFullYear()} Spot My Event. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
