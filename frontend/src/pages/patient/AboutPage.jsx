import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PatientNavBar from "../../components/patient/PatientNavBar";
import Footer from "../../components/patient/Footer";

export default function AboutPage() {
  const location = useLocation();
  const [counts, setCounts] = useState({
    patients: 0,
    appointments: 0,
    staff: 0,
    satisfaction: 0,
  });

  // Animated counter effect - restarts when page is navigated to
  useEffect(() => {
    // Reset counts when navigating to this page
    setCounts({
      patients: 0,
      appointments: 0,
      staff: 0,
      satisfaction: 0,
    });

    const targets = {
      patients: 10000,
      appointments: 50000,
      staff: 150,
      satisfaction: 98,
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCounts({
          patients: Math.floor((targets.patients * currentStep) / steps),
          appointments: Math.floor((targets.appointments * currentStep) / steps),
          staff: Math.floor((targets.staff * currentStep) / steps),
          satisfaction: Math.floor((targets.satisfaction * currentStep) / steps),
        });
      } else {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [location.pathname]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Secure & Private",
      description: "Your health data is encrypted and protected with industry-leading security standards.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "24/7 Access",
      description: "Access your health records, book appointments, and manage care anytime, anywhere.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Expert Care Team",
      description: "Connect with experienced healthcare professionals dedicated to your well-being.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Digital Health Card",
      description: "Get instant access to your digital health card with QR code for quick verification.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Smart Analytics",
      description: "Track your health trends and receive personalized insights for better care.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Easy Communication",
      description: "Stay connected with your care team through secure messaging and notifications.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#8aa082]/30 flex flex-col">
      <PatientNavBar />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-[#7e957a] to-[#5b6f59] text-white py-20 overflow-hidden"
      >
        {/* Animated background circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About Smart Healthcare System
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Revolutionizing healthcare with cutting-edge technology and
              compassionate care
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-[#7e957a] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => window.location.href = "/appointments"}
            >
              Book Appointment
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold border-2 border-white/40 hover:bg-white/30 transition-colors"
              onClick={() => window.location.href = "/patient"}
            >
              View Portal
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      <main className="flex-grow max-w-6xl mx-auto px-6 py-16 w-full">
        {/* Stats Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl border border-[#b9c8b4] p-6 text-center shadow-lg"
          >
            <motion.div className="text-4xl font-bold text-[#7e957a] mb-2">
              {counts.patients.toLocaleString()}+
            </motion.div>
            <div className="text-gray-600">Patients Served</div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl border border-[#b9c8b4] p-6 text-center shadow-lg"
          >
            <motion.div className="text-4xl font-bold text-[#7e957a] mb-2">
              {counts.appointments.toLocaleString()}+
            </motion.div>
            <div className="text-gray-600">Appointments</div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl border border-[#b9c8b4] p-6 text-center shadow-lg"
          >
            <motion.div className="text-4xl font-bold text-[#7e957a] mb-2">
              {counts.staff}+
            </motion.div>
            <div className="text-gray-600">Healthcare Staff</div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl border border-[#b9c8b4] p-6 text-center shadow-lg"
          >
            <motion.div className="text-4xl font-bold text-[#7e957a] mb-2">
              {counts.satisfaction}%
            </motion.div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </motion.div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="bg-white rounded-3xl border border-[#b9c8b4] p-10 shadow-xl">
            <h2 className="text-3xl font-bold text-[#2d3b2b] mb-6 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              At Smart Healthcare System, we're committed to transforming healthcare
              delivery through innovative technology. Our mission is to make quality
              healthcare accessible, efficient, and patient-centered. We believe
              everyone deserves seamless access to their health information and
              world-class medical care.
            </p>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <h2 className="text-3xl font-bold text-[#2d3b2b] mb-10 text-center">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl border border-[#b9c8b4] p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-[#7e957a]/10 rounded-2xl flex items-center justify-center text-[#7e957a] mb-4 group-hover:bg-[#7e957a] group-hover:text-white transition-colors"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-[#2d3b2b] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-br from-[#7e957a] to-[#5b6f59] rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of patients who trust us for their healthcare needs
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white text-[#7e957a] rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => window.location.href = "/appointments"}
            >
              Get Started Today
            </motion.button>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

