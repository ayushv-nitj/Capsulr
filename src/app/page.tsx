"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Detect scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-purple-950 to-slate-950"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text"
          >
            Capsulr
          </motion.h1>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/login")}
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className="px-6 py-2 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div
          style={{ y: heroY, opacity }}
          className="max-w-5xl mx-auto text-center z-10"
        >
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">Now in Beta</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-7xl md:text-8xl lg:text-9xl font-extrabold mb-6 leading-tight"
          >
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Capsulr
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Preserve your precious memories in digital time capsules.
            <br />
            <span className="text-purple-400">
              Unlock them at the perfect moment.
            </span>
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/register")}
            className="px-10 py-5 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all relative group"
          >
            <span className="relative z-10">Start Creating Capsules →</span>
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 blur transition-opacity"></div>
          </motion.button>

          {/* 3D Capsule Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.9, type: "spring" }}
            className="mt-20 relative perspective-1000"
          >
            <div className="relative bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto border border-white/10 transform-gpu hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>

              <div className="relative flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🎁
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-white text-lg">
                    Your First Capsule
                  </p>
                  <p className="text-sm text-purple-300">
                    Unlocks on December 25, 2025
                  </p>
                </div>
                <div className="px-4 py-2 bg-purple-500/20 rounded-full border border-purple-400/30">
                  <span className="text-purple-300 text-sm font-semibold">
                    🔒 Locked
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-left mt-4">
                "A collection of memories from our graduation day. Can't wait to
                relive these moments with everyone..."
              </p>

              <div className="flex items-center gap-2 mt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-400 to-purple-400 border-2 border-slate-900"
                    ></div>
                  ))}
                </div>
                <span className="text-sm text-gray-400 ml-2">
                  +5 collaborators
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: FEATURES (6 CARDS) */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <h3 className="text-5xl font-bold text-center mb-4">
              What You Can Do with{" "}
              <span className="bg-linear-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                Capsulr
              </span>
            </h3>
            <p className="text-center text-gray-400 mb-20 max-w-2xl mx-auto text-lg">
              Everything you need to preserve and share your most cherished
              moments
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW TO GET STARTED */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <FadeInSection>
            <h3 className="text-5xl font-bold text-center mb-4">
              How to Get Started
            </h3>
            <p className="text-center text-gray-400 mb-20 max-w-2xl mx-auto text-lg">
              Creating your first time capsule is easy. Follow these simple
              steps
            </p>
          </FadeInSection>

          <div className="space-y-24">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>

          <FadeInSection>
            <div className="text-center mt-20">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/register")}
                className="px-10 py-5 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                Start Your Journey Now →
              </motion.button>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* SECTION 4: ABOUT US & CREATOR */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <h3 className="text-5xl font-bold text-center mb-6">About Us</h3>

            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto text-center">
              Capsulr was born from a simple idea: memories are precious, and
              they deserve to be preserved in a way that's both meaningful and
              delightful. We believe that the best moments in life are meant to
              be shared and revisited.
            </p>

            <p className="text-lg text-gray-300 leading-relaxed mb-16 max-w-3xl mx-auto text-center">
              Our platform combines cutting-edge technology with an intuitive
              design to help you create digital time capsules that can be
              unlocked at just the right moment.
            </p>
          </FadeInSection>

          {/* Stats */}
          <FadeInSection>
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-8 bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10"
                >
                  <div className="text-5xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-2">
                    {stat.value}
                  </div>
                  <p className="text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </FadeInSection>

          {/* Creator Section */}
          <FadeInSection>
            <div className="max-w-4xl mx-auto">
              <h4 className="text-3xl font-bold text-center mb-12">
                Meet the Creator
              </h4>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Avatar */}
                  <div className="shrink-0">
                    <div className="w-32 h-32 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 p-1">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-6xl">
                        👨‍💻
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h5 className="text-2xl font-bold mb-2">Ayush Verma</h5>
                    <p className="text-purple-400 mb-4">Full Stack Developer & Creator of Capsulr</p>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      Passionate about creating meaningful digital experiences that help people preserve and share their most precious moments. Building Capsulr to make memory preservation beautiful and accessible.
                    </p>

                    {/* Social Links */}
                    <div className="flex gap-4 justify-center md:justify-start">
                      <motion.a
                        whileHover={{ scale: 1.1, y: -2 }}
                        href="https://www.linkedin.com/in/ayush-verma-jsr25/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-full transition-all"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span>LinkedIn</span>
                      </motion.a>

                      <motion.a
                        whileHover={{ scale: 1.1, y: -2 }}
                        href="https://github.com/ayushv-nitj"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 rounded-full transition-all"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>GitHub</span>
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-slate-900/50 backdrop-blur-xl border-t border-white/10 py-12 px-6 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            Capsulr
          </h2>
          <p className="text-gray-400 mb-6">
            Preserving memories, one capsule at a time
          </p>
           <p className="text-gray-400 mb-6">
            Made with ❤️ by Ayush Verma
          </p>

          <div className="flex justify-center gap-6 text-sm text-gray-400 mb-6">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition">
              Contact Us
            </a>
          </div>

          <p className="text-sm text-gray-500">
            © 2025 Capsulr. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

// ========== HELPER COMPONENTS ==========

function FadeInSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-linear-to-r from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className={`relative w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
        {feature.icon}
      </div>

      <h4 className="relative text-2xl font-bold mb-4 text-white">
        {feature.title}
      </h4>

      <p className="relative text-gray-300 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

function StepCard({ step, index }: { step: any; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -50 : 50 }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12`}
    >
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        className="shrink-0 w-20 h-20 bg-linear-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-purple-500/50"
      >
        {step.number}
      </motion.div>

      <div className={`flex-1 ${isEven ? "md:text-left" : "md:text-right"}`}>
        <h4 className="text-3xl font-bold mb-4 text-white">{step.title}</h4>
        <p className="text-gray-300 leading-relaxed text-lg">
          {step.description}
        </p>
      </div>

      <motion.div
        whileHover={{ scale: 1.05, rotateY: 5 }}
        className={`shrink-0 w-80 h-48 ${step.gradient} rounded-3xl flex items-center justify-center text-8xl shadow-2xl border border-white/10`}
      >
        {step.icon}
      </motion.div>
    </motion.div>
  );
}

// ========== DATA ==========

const features = [
  {
    icon: "⏰",
    title: "Time-Locked Capsules",
    description: "Set a future date to unlock your memories. Perfect for birthdays, anniversaries, or special milestones.",
    gradient: "bg-linear-to-r from-blue-500 to-cyan-500"
  },
  {
    icon: "🖼️",
    title: "Rich Media Support",
    description: "Add photos, videos, audio messages, and formatted text to create vibrant, multimedia memories.",
    gradient: "bg-linear-to-r from-purple-500 to-pink-500"
  },
  {
    icon: "👥",
    title: "Collaborative Capsules",
    description: "Invite friends and family to contribute their own memories to shared capsules.",
    gradient: "bg-linear-to-r from-orange-500 to-red-500"
  },
  {
    icon: "📧",
    title: "Email Notifications",
    description: "Recipients get notified when capsules unlock, ensuring no special moment is missed.",
    gradient: "bg-linear-to-r from-green-500 to-emerald-500"
  },
  {
    icon: "🎨",
    title: "Custom Themes",
    description: "Personalize each capsule with custom themes to match the occasion and mood.",
    gradient: "bg-linear-to-r from-indigo-500 to-blue-500"
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your memories are encrypted and stored securely. Only you and your chosen recipients can access them.",
    gradient: "bg-linear-to-r from-pink-500 to-rose-500"
  }
];

const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up with your email in just seconds. No credit card required. Start preserving memories immediately.",
    icon: "📝",
    gradient: "bg-linear-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl"
  },
  {
    number: 2,
    title: "Create a Capsule",
    description: "Give your capsule a name, choose a theme, and set when it should unlock. You can always edit these details later.",
    icon: "🎁",
    gradient: "bg-linear-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl"
  },
  {
    number: 3,
    title: "Add Memories",
    description: "Upload photos, videos, audio messages, or write text entries. Invite collaborators to contribute their memories too.",
    icon: "📸",
    gradient: "bg-linear-to-br from-pink-900/30 to-rose-900/30 backdrop-blur-xl"
  },
  {
    number: 4,
    title: "Wait for the Magic",
    description: "Your capsule will automatically unlock on the date you set. Recipients will be notified via email to relive the memories.",
    icon: "✨",
    gradient: "bg-linear-to-br from-orange-900/30 to-red-900/30 backdrop-blur-xl"
  }
];

const stats = [
  { value: "10+", label: "Capsules Created" },
  { value: "50+", label: "Memories Preserved" },
  { value: "5+", label: "Happy Users" }
];