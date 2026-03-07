import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// ──────────────────────────────────────────────
// Tiny hook: detect when an element enters the viewport
// ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(el);
                }
            },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

// ──────────────────────────────────────────────
// Animated count-up numbers
// ──────────────────────────────────────────────
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView();

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 1800;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

// ──────────────────────────────────────────────
// FadeIn wrapper
// ──────────────────────────────────────────────
function FadeIn({
    children,
    delay = 0,
    fromBottom = true,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    fromBottom?: boolean;
    className?: string;
}) {
    const { ref, inView } = useInView();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : fromBottom ? "translateY(32px)" : "translateX(-32px)",
                transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// ──────────────────────────────────────────────
// Feature card data
// ──────────────────────────────────────────────
const features = [
    {
        icon: "🔋",
        title: "AI Health Prediction",
        desc: "State-of-the-art ML models predict battery degradation with up to 97% accuracy using real-time electrochemical data.",
        color: "from-emerald-500 to-green-400",
    },
    {
        icon: "📊",
        title: "Real-Time Analytics",
        desc: "Interactive dashboards track SoC, SoH, internal resistance, and temperature cycles with millisecond granularity.",
        color: "from-cyan-500 to-teal-400",
    },
    {
        icon: "🔔",
        title: "Smart Alert System",
        desc: "Configurable multi-channel alerts via email, push, or SMS notify you the moment anomalies are detected.",
        color: "from-green-500 to-emerald-400",
    },
    {
        icon: "♻️",
        title: "Eco Disposal Guide",
        desc: "AI-driven recommendations route end-of-life batteries to the optimal recycling, refurbishing, or disposal pathway.",
        color: "from-teal-500 to-cyan-400",
    },
    {
        icon: "🗺️",
        title: "Digital Battery Passport",
        desc: "Immutable lifecycle records satisfy EU Battery Regulation compliance with exportable QR-linked passports.",
        color: "from-emerald-600 to-green-500",
    },
    {
        icon: "🛒",
        title: "Battery Marketplace",
        desc: "List, buy, and sell certified second-life batteries within a trusted community powered by verified health scores.",
        color: "from-green-600 to-teal-500",
    },
];

// ──────────────────────────────────────────────
// Stats data
// ──────────────────────────────────────────────
const stats = [
    { value: 97, suffix: "%", label: "Prediction Accuracy" },
    { value: 15000, suffix: "+", label: "Batteries Monitored" },
    { value: 40, suffix: "%", label: "Waste Reduction" },
    { value: 99, suffix: "%", label: "Uptime Guarantee" },
];

// ──────────────────────────────────────────────
// How it works steps
// ──────────────────────────────────────────────
const steps = [
    { num: "01", title: "Register Your Battery", desc: "Enter make, model, chemistry, and capacity. Our system creates a unique digital ID." },
    { num: "02", title: "Connect & Monitor", desc: "Stream live telemetry via our SDK, API, or IoT bridge. Data is encrypted end-to-end." },
    { num: "03", title: "Get AI Insights", desc: "Our ML engine continuously analyses data and delivers health scores, warnings, and reports." },
    { num: "04", title: "Act on Recommendations", desc: "Follow personalised maintenance tips, schedule recycling, or list your battery on the marketplace." },
];

// ──────────────────────────────────────────────
// Testimonials
// ──────────────────────────────────────────────
const testimonials = [
    {
        quote: "BATT IQ cut our fleet's unplanned downtime by 60%. The early-warning alerts are a game-changer.",
        name: "Priya Sharma",
        role: "Fleet Operations Manager, GreenLogix",
        avatar: "PS",
    },
    {
        quote: "The battery passport feature made our EU compliance audit completely painless. Absolutely brilliant.",
        name: "Jonas Weber",
        role: "Sustainability Lead, EcoMobility GmbH",
        avatar: "JW",
    },
    {
        quote: "We recovered 35% more value from end-of-life packs by routing them through the marketplace instead of scrapping.",
        name: "Aisha Mensah",
        role: "Circular Economy Director, ReTech Africa",
        avatar: "AM",
    },
];

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
const LandingPage: React.FC = () => {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#050d14] text-white overflow-x-hidden" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>

            {/* ── Ambient orbs ── */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div
                    className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
                    style={{
                        background: "radial-gradient(circle, hsl(150 100% 50%) 0%, transparent 70%)",
                        animation: "orbFloat 12s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
                    style={{
                        background: "radial-gradient(circle, hsl(190 90% 50%) 0%, transparent 70%)",
                        animation: "orbFloat 16s ease-in-out infinite reverse",
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
                    style={{ background: "radial-gradient(circle, hsl(150 100% 50%) 0%, transparent 60%)" }}
                />
            </div>

            {/* ─────────────────── NAVBAR ─────────────────── */}
            <header
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled ? "rgba(5,13,20,0.85)" : "transparent",
                    backdropFilter: scrolled ? "blur(16px)" : "none",
                    borderBottom: scrolled ? "1px solid rgba(0,255,128,0.08)" : "none",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                            style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                        >
                            ⚡
                        </div>
                        <span
                            className="text-xl font-black tracking-tight"
                            style={{ background: "linear-gradient(135deg, hsl(150 100% 60%), hsl(190 90% 60%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                        >
                            BATT IQ
                        </span>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
                        {["Features", "How It Works", "Stats", "Testimonials"].map((n) => (
                            <a
                                key={n}
                                href={`#${n.toLowerCase().replace(/ /g, "-")}`}
                                className="hover:text-white transition-colors duration-200 hover:text-emerald-400"
                            >
                                {n}
                            </a>
                        ))}
                    </nav>

                    {/* CTA buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-black transition-all duration-200 hover:opacity-90 hover:scale-105"
                                style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200 border border-white/10 hover:border-emerald-500/40"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register-account"
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-black transition-all duration-200 hover:opacity-90 hover:scale-105"
                                    style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                                >
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden flex flex-col items-center justify-center gap-1.5 p-3 min-w-[48px] min-h-[48px] rounded-lg hover:bg-white/5 transition-colors"
                        onClick={() => setMobileMenuOpen((o) => !o)}
                        aria-label="Toggle menu"
                    >
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="block w-5 h-0.5 bg-white/70 rounded-full transition-all duration-300"
                                style={{
                                    transform:
                                        mobileMenuOpen && i === 0
                                            ? "translateY(8px) rotate(45deg)"
                                            : mobileMenuOpen && i === 2
                                                ? "translateY(-8px) rotate(-45deg)"
                                                : mobileMenuOpen && i === 1
                                                    ? "scaleX(0)"
                                                    : "none",
                                }}
                            />
                        ))}
                    </button>
                </div>

                {/* Mobile menu */}
                <div
                    className="md:hidden overflow-hidden transition-all duration-300"
                    style={{ maxHeight: mobileMenuOpen ? "300px" : "0px" }}
                >
                    <div className="px-6 pb-6 pt-2 flex flex-col gap-4 bg-[#050d14]/95 backdrop-blur-lg border-t border-white/5">
                        {["Features", "How It Works", "Stats", "Testimonials"].map((n) => (
                            <a
                                key={n}
                                href={`#${n.toLowerCase().replace(/ /g, "-")}`}
                                className="text-white/70 hover:text-emerald-400 transition-colors text-sm font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {n}
                            </a>
                        ))}
                        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="text-center py-2 rounded-lg text-sm font-semibold text-black"
                                    style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-center py-2 rounded-lg border border-white/10 text-sm font-semibold text-white/80">
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register-account"
                                        className="text-center py-2 rounded-lg text-sm font-semibold text-black"
                                        style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                                    >
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ─────────────────── HERO ─────────────────── */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border"
                    style={{
                        background: "rgba(0,255,128,0.07)",
                        borderColor: "rgba(0,255,128,0.25)",
                        color: "hsl(150 100% 60%)",
                        animation: "fadeSlideDown 0.8s ease 0.2s both",
                    }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AI-Powered Battery Intelligence Platform
                </div>

                {/* Headline */}
                <h1
                    className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6 max-w-5xl"
                    style={{ animation: "fadeSlideDown 0.8s ease 0.4s both" }}
                >
                    <span className="text-white">Know Your </span>
                    <span
                        className="block"
                        style={{ background: "linear-gradient(135deg, hsl(150 100% 60%), hsl(190 90% 60%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                    >
                        Battery's Future
                    </span>
                    <span className="text-white text-3xl sm:text-5xl md:text-6xl mt-2 block sm:inline">Before It Fails</span>
                </h1>

                {/* Sub-headline */}
                <p
                    className="max-w-2xl text-lg sm:text-xl text-white/55 leading-relaxed mb-10"
                    style={{ animation: "fadeSlideDown 0.8s ease 0.6s both" }}
                >
                    BATT IQ combines cutting-edge machine learning, real-time telemetry, and circular-economy tools to extend battery lifespan, prevent failures, and guide sustainable disposal.
                </p>

                {/* CTAs */}
                <div
                    className="flex flex-col sm:flex-row items-center gap-4 mb-16"
                    style={{ animation: "fadeSlideDown 0.8s ease 0.8s both" }}
                >
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="group relative px-8 py-4 rounded-xl text-base font-bold text-black overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,128,0.4)]"
                            style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Go to Dashboard
                                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                            </span>
                        </Link>
                    ) : (
                        <Link
                            to="/register-account"
                            className="group relative px-8 py-4 rounded-xl text-base font-bold text-black overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,128,0.4)]"
                            style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Monitoring Free
                                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                            </span>
                        </Link>
                    )}
                    <a
                        href="#how-it-works"
                        className="px-8 py-4 rounded-xl text-base font-bold text-white border border-white/15 hover:border-emerald-500/40 hover:bg-white/5 transition-all duration-300"
                    >
                        See How It Works
                    </a>
                </div>

                {/* Animated battery visual */}
                <div
                    className="relative w-40 h-72 mx-auto"
                    style={{ animation: "fadeSlideDown 0.8s ease 1s both" }}
                >
                    {/* Battery shell */}
                    <div
                        className="absolute inset-0 rounded-3xl border-2"
                        style={{ borderColor: "rgba(0,255,128,0.4)", boxShadow: "0 0 40px rgba(0,255,128,0.2), inset 0 0 20px rgba(0,255,128,0.05)" }}
                    />
                    {/* Battery tip */}
                    <div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-4 rounded-t-lg"
                        style={{ background: "rgba(0,255,128,0.35)" }}
                    />
                    {/* Fill */}
                    <div
                        className="absolute bottom-3 left-3 right-3 rounded-2xl"
                        style={{
                            background: "linear-gradient(to top, hsl(150 100% 50%), hsl(190 90% 50%))",
                            animation: "batteryFill 3s ease-in-out infinite alternate",
                            boxShadow: "0 0 20px rgba(0,255,128,0.5)",
                        }}
                    />
                    {/* Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <span className="text-3xl font-black text-white" style={{ textShadow: "0 0 20px rgba(0,255,128,0.8)" }}>
                            IQ
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">
                            97% Health
                        </span>
                    </div>
                    {/* Floating particles */}
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-emerald-400"
                            style={{
                                left: `${20 + i * 15}%`,
                                bottom: "50%",
                                opacity: 0.7,
                                animation: `particleRise ${1.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
                            }}
                        />
                    ))}
                </div>

                {/* Trust logos */}
                <div className="mt-16 flex flex-col items-center gap-4" style={{ animation: "fadeSlideDown 0.8s ease 1.2s both" }}>
                    <p className="text-xs text-white/30 font-semibold uppercase tracking-widest">Trusted by innovators worldwide</p>
                    <div className="flex items-center gap-8 flex-wrap justify-center">
                        {["EV Fleet Pro", "GreenLogix", "ReTech Africa", "EcoMobility"].map((brand) => (
                            <span key={brand} className="text-white/20 font-bold text-sm tracking-wide hover:text-white/40 transition-colors duration-300">
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────────────── STATS ─────────────────── */}
            <section id="stats" className="relative z-10 py-20 border-y border-white/5">
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, rgba(0,255,128,0.03), rgba(0,208,255,0.03))" }}
                />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((s, i) => (
                            <FadeIn key={s.label} delay={i * 120} className="text-center">
                                <div
                                    className="text-5xl md:text-6xl font-black mb-2"
                                    style={{ background: "linear-gradient(135deg, hsl(150 100% 60%), hsl(190 90% 60%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                                >
                                    <CountUp target={s.value} suffix={s.suffix} />
                                </div>
                                <p className="text-white/50 text-sm font-medium">{s.label}</p>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────────────── FEATURES ─────────────────── */}
            <section id="features" className="relative z-10 py-28 px-6">
                <div className="max-w-7xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">What We Offer</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Everything Your Battery Needs</h2>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto">
                            End-to-end battery intelligence in one platform — from live telemetry to circular economy compliance.
                        </p>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <FadeIn key={f.title} delay={i * 100}>
                                <div
                                    className="group relative p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all duration-500 cursor-default overflow-hidden"
                                    style={{
                                        background: "rgba(255,255,255,0.02)",
                                        backdropFilter: "blur(12px)",
                                    }}
                                >
                                    {/* Hover glow */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                                        style={{ background: `radial-gradient(circle at 50% 0%, rgba(0,255,128,0.06), transparent 70%)` }}
                                    />
                                    {/* Icon */}
                                    <div
                                        className="relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                                        style={{ background: `linear-gradient(135deg, rgba(0,255,128,0.15), rgba(0,208,255,0.1))`, border: "1px solid rgba(0,255,128,0.2)" }}
                                    >
                                        {f.icon}
                                    </div>
                                    <h3 className="relative font-bold text-white text-lg mb-2 group-hover:text-emerald-400 transition-colors duration-300">
                                        {f.title}
                                    </h3>
                                    <p className="relative text-white/50 text-sm leading-relaxed">{f.desc}</p>
                                    {/* Arrow */}
                                    <div className="relative mt-4 text-emerald-400/0 group-hover:text-emerald-400 transition-all duration-300 text-sm font-semibold flex items-center gap-1 translate-x-0 group-hover:translate-x-1">
                                        Learn more →
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────────────── HOW IT WORKS ─────────────────── */}
            <section id="how-it-works" className="relative z-10 py-28 px-6">
                <div
                    className="absolute inset-0 -z-10"
                    style={{ background: "radial-gradient(ellipse at center, rgba(0,255,128,0.04) 0%, transparent 70%)" }}
                />
                <div className="max-w-4xl mx-auto">
                    <FadeIn className="text-center mb-20">
                        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">Simple Process</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Up & Running in Minutes</h2>
                        <p className="text-white/50 text-lg max-w-xl mx-auto">No complex integrations. No steep learning curves. Just actionable battery intelligence from day one.</p>
                    </FadeIn>

                    <div className="relative">
                        {/* Connector line */}
                        <div
                            className="absolute left-10 top-10 bottom-10 w-px hidden md:block"
                            style={{ background: "linear-gradient(to bottom, hsl(150 100% 50%), hsl(190 90% 50%))", opacity: 0.2 }}
                        />

                        <div className="flex flex-col gap-10">
                            {steps.map((s, i) => (
                                <FadeIn key={s.num} delay={i * 150} fromBottom>
                                    <div className="flex gap-6 items-start group">
                                        {/* Step number */}
                                        <div
                                            className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-black transition-all duration-300 group-hover:scale-110"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(0,255,128,0.12), rgba(0,208,255,0.08))",
                                                border: "1px solid rgba(0,255,128,0.25)",
                                                boxShadow: "0 0 20px rgba(0,255,128,0.08)",
                                                color: "hsl(150 100% 60%)",
                                                fontVariantNumeric: "tabular-nums",
                                            }}
                                        >
                                            {s.num}
                                        </div>
                                        <div className="pt-3">
                                            <h3 className="font-bold text-white text-xl mb-1 group-hover:text-emerald-400 transition-colors duration-300">{s.title}</h3>
                                            <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────────────── TESTIMONIALS ─────────────────── */}
            <section id="testimonials" className="relative z-10 py-28 px-6">
                <div className="max-w-7xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">Real Results</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Loved by Industry Leaders</h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <FadeIn key={t.name} delay={i * 150}>
                                <div
                                    className="p-6 rounded-2xl border border-white/5 hover:border-emerald-500/25 transition-all duration-500 relative group"
                                    style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(8px)" }}
                                >
                                    {/* Quote mark */}
                                    <div
                                        className="absolute top-4 right-5 text-6xl font-black leading-none select-none"
                                        style={{ color: "rgba(0,255,128,0.08)" }}
                                    >
                                        "
                                    </div>
                                    <p className="text-white/70 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-black flex-shrink-0"
                                            style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                                        >
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">{t.name}</p>
                                            <p className="text-white/40 text-xs">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────────────── CTA ─────────────────── */}
            <section className="relative z-10 py-28 px-6">
                <FadeIn>
                    <div
                        className="max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,255,128,0.1), rgba(0,208,255,0.07))",
                            border: "1px solid rgba(0,255,128,0.2)",
                            boxShadow: "0 0 60px rgba(0,255,128,0.08)",
                        }}
                    >
                        {/* BG shimmer */}
                        <div
                            className="absolute inset-0 rounded-3xl"
                            style={{
                                background: "radial-gradient(circle at 30% 50%, rgba(0,255,128,0.06) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(0,208,255,0.06) 0%, transparent 60%)",
                            }}
                        />
                        <div className="relative z-10">
                            <div className="text-5xl mb-6" style={{ animation: "float 4s ease-in-out infinite" }}>⚡</div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to Give Your Batteries the IQ They Deserve?</h2>
                            <p className="text-white/55 text-lg mb-10 max-w-xl mx-auto">
                                Join thousands of engineers and sustainability leaders who trust BATT IQ to protect their assets and the planet.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {user ? (
                                    <Link
                                        to="/dashboard"
                                        className="px-8 py-4 rounded-xl font-bold text-black text-base transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,128,0.5)]"
                                        style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                                    >
                                        Go to Dashboard →
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/register-account"
                                            className="px-8 py-4 rounded-xl font-bold text-black text-base transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,128,0.5)]"
                                            style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                                        >
                                            Create Free Account →
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="px-8 py-4 rounded-xl font-bold text-white text-base border border-white/15 hover:border-emerald-400/40 hover:bg-white/5 transition-all duration-300"
                                        >
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>
                            <p className="mt-6 text-white/30 text-xs">No credit card required · Free forever for single batteries · Cancel anytime</p>
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* ─────────────────── FOOTER ─────────────────── */}
            <footer className="relative z-10 border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white/30 text-sm">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
                            style={{ background: "linear-gradient(135deg, hsl(150 100% 50%), hsl(190 90% 50%))" }}
                        >
                            ⚡
                        </div>
                        <span className="font-black text-white/60">BATT IQ</span>
                    </div>
                    <p>© {new Date().getFullYear()} BATT IQ. All rights reserved. Powering a sustainable future.</p>
                    <div className="flex gap-6">
                        <Link to="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
                        <Link to="/register-account" className="hover:text-white/60 transition-colors">Register</Link>
                    </div>
                </div>
            </footer>

            {/* ─────────────────── KEYFRAMES ─────────────────── */}
            <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.05); }
        }
        @keyframes batteryFill {
          0% { height: 30%; }
          100% { height: 80%; }
        }
        @keyframes particleRise {
          0% { transform: translateY(0); opacity: 0.7; }
          100% { transform: translateY(-80px); opacity: 0; }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </div>
    );
};

export default LandingPage;
