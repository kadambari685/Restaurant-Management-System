import { useState, useEffect, useRef, useCallback } from "react";
import { getMenu, createReservation } from "./services/api";
import { motion } from "motion/react";
import {
  Star, MapPin, Clock, Users, Menu, X, Send, Sparkles,
  Award, Wine, UtensilsCrossed, Heart, ArrowRight,
  Flame, Timer, ChevronLeft, ChevronRight, Check,
  Instagram, Globe, Phone, Leaf,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Occasion = "romantic" | "birthday" | "family" | "corporate" | "friends" | "solo" | "brunch" | "festival";
type MenuTab = "starters" | "mains" | "desserts" | "wine";
type SeatingType = "indoor" | "outdoor" | "window" | "garden" | "private" | "chef" | "rooftop";

interface Stat {
  value: number;
  label: string;
  suffix: string;
  decimal?: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const OCCASIONS: { id: Occasion; label: string; emoji: string; color: string; message: string }[] = [
  { id: "romantic", label: "Romantic Date", emoji: "🌹", color: "#C97B7B", message: "A curated evening for two — candlelit table by the window, chef's tasting menu, and our sommelier's finest selection awaiting your arrival." },
  { id: "birthday", label: "Birthday", emoji: "🎂", color: "#D4AF37", message: "A celebration worthy of the occasion — personalised dessert, complimentary champagne, and an evening your guests will remember forever." },
  { id: "family", label: "Family Dinner", emoji: "👨‍👩‍👧", color: "#FF8A3D", message: "Warm, inviting, and full of flavour — our family-style sharing platters bring everyone together around a single beautiful story." },
  { id: "corporate", label: "Corporate", emoji: "💼", color: "#7B9EC9", message: "Impress clients with a private dining room — impeccable service, discreet ambience, and cuisine that makes the right impression." },
  { id: "friends", label: "Friends Night", emoji: "🥂", color: "#43D17A", message: "Toast to great company with our sharing boards, craft cocktails, and the most vibrant corner of the restaurant." },
  { id: "solo", label: "Solo Dining", emoji: "🧘", color: "#9B8EC9", message: "The finest solo experience — counter seating, personal chef interaction, and a journey through our signature tasting menu." },
  { id: "brunch", label: "Weekend Brunch", emoji: "☀️", color: "#F5C842", message: "Lazy mornings perfected — bottomless mimosas, artisanal pastries, eggs done twelve ways, and light flooding the room." },
  { id: "festival", label: "Celebration", emoji: "🎉", color: "#FF6B6B", message: "Festive spirit meets Michelin excellence — seasonal menus, bespoke decor, and a celebration unlike any other." },
];

interface Dish {
  id: number;
  name: string;
  desc: string;
  price: string;
  cal: string;
  time: string;
  rating: number;
  tag: string;
  img: string;
}

const DISHES: Record<MenuTab, Dish[]> = {
  starters: [
    { id: 1, name: "Truffle Arancini", desc: "Black truffle, aged parmesan, saffron aioli, microgreens", price: "₹1,450", cal: "320 kcal", time: "8 min", rating: 4.9, tag: "Chef's Pick", img: "photo-1476718406336-bb5a9690ee2a" },
    { id: 2, name: "Seared Hokkaido Scallops", desc: "Cauliflower purée, crispy capers, lemon beurre blanc", price: "₹1,890", cal: "280 kcal", time: "6 min", rating: 4.8, tag: "Popular", img: "photo-1519708227418-c8fd9a32b7a2" },
    { id: 3, name: "Foie Gras Torchon", desc: "Brioche toast, fig jam, Sauternes port reduction", price: "₹2,200", cal: "410 kcal", time: "10 min", rating: 4.9, tag: "Signature", img: "photo-1490645935967-10de6ba17061" },
  ],
  mains: [
    { id: 4, name: "A5 Wagyu Striploin", desc: "200g Japanese A5, truffle butter, bone marrow jus, pommes pont-neuf", price: "₹8,500", cal: "680 kcal", time: "18 min", rating: 5.0, tag: "Iconic", img: "photo-1544025162-d76694265947" },
    { id: 5, name: "Chilean Sea Bass", desc: "Miso-glazed, bok choy, dashi broth, crispy shallots, yuzu gel", price: "₹4,200", cal: "420 kcal", time: "15 min", rating: 4.8, tag: "Light", img: "photo-1467003909585-2f8a72700288" },
    { id: 6, name: "Duck Confit Royale", desc: "72-hour confit, cherry gastrique, pommes sarladaises, haricots verts", price: "₹3,800", cal: "580 kcal", time: "20 min", rating: 4.7, tag: "Classic", img: "photo-1432139555190-58524dae6a55" },
  ],
  desserts: [
    { id: 7, name: "Chocolate Lava Sphere", desc: "Valrhona 70%, salted caramel core, vanilla bean gelato, cocoa tuile", price: "₹980", cal: "450 kcal", time: "12 min", rating: 4.9, tag: "Showstopper", img: "photo-1488477181946-6428a0291777" },
    { id: 8, name: "Mango Passion Soufflé", desc: "Alphonso mango, passion fruit coulis, toasted coconut sorbet", price: "₹850", cal: "280 kcal", time: "14 min", rating: 4.8, tag: "Seasonal", img: "photo-1551024506-0bccd828d307" },
    { id: 9, name: "Truffle Honey Cheesecake", desc: "New York style, black truffle honey, candied Périgord walnuts", price: "₹1,100", cal: "520 kcal", time: "5 min", rating: 4.7, tag: "Signature", img: "photo-1565958011703-44f9829ba187" },
  ],
  wine: [
    { id: 10, name: "Château Margaux 2015", desc: "Bordeaux Grand Cru Classé · Rich, velvety, dark cherries and cassis", price: "₹28,000", cal: "—", time: "Decant 45 min", rating: 4.9, tag: "Collector", img: "photo-1510812431401-41d2bd2722f3" },
    { id: 11, name: "Barolo Riserva 2016", desc: "Piedmont DOCG · Tar, dried roses, dark cherry, long structured finish", price: "₹18,500", cal: "—", time: "Decant 30 min", rating: 4.8, tag: "Sommelier's Pick", img: "photo-1474722883778-792e7990302f" },
    { id: 12, name: "Dom Pérignon 2012", desc: "Champagne AOC · Toasted brioche, white flowers, candied citrus zest", price: "₹42,000", cal: "—", time: "Serve at 9°C", rating: 5.0, tag: "Prestige", img: "photo-1547595628-c61a29f496f0" },
  ],
};

const SEATINGS: { id: SeatingType; label: string; emoji: string; desc: string; available: string }[] = [
  { id: "indoor", label: "Indoor", emoji: "🏛️", desc: "Climate-controlled elegance", available: "4 tables" },
  { id: "outdoor", label: "Outdoor", emoji: "🌿", desc: "Al fresco ambience", available: "6 tables" },
  { id: "window", label: "Window", emoji: "🌅", desc: "Panoramic city views", available: "2 tables" },
  { id: "garden", label: "Garden", emoji: "🌸", desc: "Lush botanical setting", available: "3 tables" },
  { id: "private", label: "Private Room", emoji: "🎭", desc: "Exclusive for 8–20 guests", available: "1 room" },
  { id: "chef", label: "Chef's Table", emoji: "👨‍🍳", desc: "Kitchen-side experience", available: "2 seats" },
  { id: "rooftop", label: "Rooftop", emoji: "🌃", desc: "Skyline under the stars", available: "5 tables" },
];

const STATS: Stat[] = [
  { value: 250000, label: "Happy Guests", suffix: "+" },
  { value: 4.9, label: "Google Rating", suffix: "★", decimal: 1 },
  { value: 25, label: "International Awards", suffix: "+" },
  { value: 15, label: "Years of Excellence", suffix: "+" },
];

const REVIEWS = [
  { name: "Priya Mehra", role: "Food Critic, Condé Nast Traveller", text: "An experience that transcends dining. The AI concierge knew my preferences before I spoke them. The A5 Wagyu was poetry on a plate — a masterclass in restraint and brilliance.", rating: 5, img: "photo-1494790108755-2616b8c0b68a" },
  { name: "James Whitfield", role: "International Michelin Inspector", text: "Three stars do not do justice to what LUMINA has achieved. The tasting menu is a love letter to the finest ingredients on earth, served with invisible precision.", rating: 5, img: "photo-1472099645785-5658abf4ff4e" },
  { name: "Ananya Krishnan", role: "Chef & James Beard Award Recipient", text: "I have dined in Paris, Tokyo, and New York. LUMINA stands alone. The farm-to-table philosophy is lived, not merely marketed. I will return.", rating: 5, img: "photo-1438761681033-6461ffad8d80" },
];

const JOURNEY = [
  { icon: "🌾", label: "The Farm", desc: "Single-origin ingredients sourced within 100 km by our team" },
  { icon: "🧑‍🌾", label: "Hand-Picked", desc: "Selected at peak season — never frozen, never compromised" },
  { icon: "🏛️", label: "Our Kitchen", desc: "French technique meets Indian soul over 14-hour preparations" },
  { icon: "🍽️", label: "The Plating", desc: "Each dish a canvas — timed to perfection, served with care" },
  { icon: "✨", label: "Your Story", desc: "A memory that lingers long after the last bite is taken" },
];

const GALLERY = [
  { img: "photo-1414235077428-338989a2e8c0", col: "col-span-2 row-span-2", label: "The Dining Hall" },
  { img: "photo-1544025162-d76694265947", col: "", label: "Signature Wagyu" },
  { img: "photo-1510812431401-41d2bd2722f3", col: "", label: "The Wine Cellar" },
  { img: "photo-1577219491135-ce391730fb2c", col: "", label: "Chef at Work" },
  { img: "photo-1488477181946-6428a0291777", col: "col-span-2", label: "Dessert Atelier" },
];

const AI_RESPONSES: Record<string, string> = {
  romantic: "How beautiful — a night to remember. I recommend Table 7 by the window with our 7-course Lovers' Tasting Menu and the sommelier's Champagne pairing. Shall I also arrange rose petals and a personalised menu card?",
  birthday: "Happy birthday! 🎂 The Birthday Experience package includes the Chef's tasting menu, a personalised soufflé with your name, and a complimentary glass of Dom Pérignon to begin. Our team will make it magical.",
  vegetarian: "Our plant-forward menu is a celebration of the season's finest produce. Tonight I suggest the Heirloom Beet Carpaccio, Truffle Risotto, and Mango Passion Soufflé to close. Absolutely divine.",
  wine: "Our sommelier tends one of the finest cellars in the city. For tonight, the Barolo Riserva 2016 pairs beautifully with our duck confit — its dried roses and structured tannins are extraordinary. Shall I reserve a bottle?",
  allergy: "Your safety is our absolute priority. Please share the specific allergens and our head chef will personally craft a tasting menu that is safe, delicious, and as luxurious as anything on our main menu.",
  default: "Welcome to LUMINA. I am here to craft your perfect evening — from table selection and menu curation to wine pairing and special arrangements. What can I create for you tonight?",
};

function getAIResponse(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("anniversary") || l.includes("romantic") || l.includes("date") || l.includes("love")) return AI_RESPONSES.romantic;
  if (l.includes("birthday") || l.includes("celebrate") || l.includes("celebration")) return AI_RESPONSES.birthday;
  if (l.includes("vegetarian") || l.includes("vegan") || l.includes("plant") || l.includes("no meat")) return AI_RESPONSES.vegetarian;
  if (l.includes("wine") || l.includes("champagne") || l.includes("drink") || l.includes("pairing")) return AI_RESPONSES.wine;
  if (l.includes("allerg") || l.includes("intolerance") || l.includes("gluten") || l.includes("nut")) return AI_RESPONSES.allergy;
  return AI_RESPONSES.default;
}

// ─── Counter Hook ─────────────────────────────────────────────────────────────
function useCounter(target: number, decimal: number, active: boolean): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 2200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(decimal)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, decimal]);
  return count;
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({ stat, active, accent }: { stat: Stat; active: boolean; accent: string }) {
  const count = useCounter(stat.value, stat.decimal ?? 0, active);
  const display = stat.decimal ? count.toFixed(stat.decimal) : Math.floor(count).toLocaleString();
  return (
    <div className="text-center">
      <div className="text-5xl md:text-6xl font-light mb-3 transition-all duration-300"
        style={{ color: accent, fontFamily: "'Playfair Display', serif" }}>
        {display}{stat.suffix}
      </div>
      <div className="text-xs tracking-[0.25em] text-white/35 uppercase">{stat.label}</div>
    </div>
  );
}

// ─── Gold divider ─────────────────────────────────────────────────────────────
function SectionLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="w-8 h-px" style={{ background: accent }} />
      <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: accent }}>{label}</span>
      <div className="w-8 h-px" style={{ background: accent }} />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    async function fetchMenu() {
        try {
            const data = await getMenu();
            console.log("Menu from Backend:", data);
        } catch (error) {
            console.error("Error fetching menu:", error);
        }
    }

    fetchMenu();
}, []);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [navOpen, setNavOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [activeTab, setActiveTab] = useState<MenuTab>("mains");
  const [selectedSeating, setSelectedSeating] = useState<SeatingType | null>(null);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: AI_RESPONSES.default },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [reserveStep, setReserveStep] = useState(1);
  const [partySize, setPartySize] = useState<number | null>(null);
  const [hoveredDish, setHoveredDish] = useState<number | null>(null);
  const [galleryHover, setGalleryHover] = useState<number | null>(null);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [hoveredOccasion, setHoveredOccasion] = useState<Occasion | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [reservation, setReservation] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    occasion: "",
    party_size: 2,
    seating: ""
});

  const statsRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const occ = selectedOccasion ? OCCASIONS.find(o => o.id === selectedOccasion) : null;
  const accent = hoveredOccasion
    ? (OCCASIONS.find(o => o.id === hoveredOccasion)?.color ?? "#D4AF37")
    : (occ?.color ?? "#D4AF37");

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setNavScrolled(window.scrollY > 60);
    };
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!journeyRef.current) return;
    const items = journeyRef.current.querySelectorAll<HTMLElement>("[data-step]");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const step = parseInt((e.target as HTMLElement).dataset.step ?? "0");
          setVisibleSteps(prev => prev.includes(step) ? prev : [...prev, step]);
        }
      });
    }, { threshold: 0.2 });
    items.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "ai", text: getAIResponse(text) }]);
    }, 1100);
  }, [input]);

  const quickPrompt = (prompt: string) => {
    setMessages(prev => [...prev, { role: "user", text: prompt }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "ai", text: getAIResponse(prompt) }]);
    }, 1100);
  };

  const handleReservation = async () => {
  try {
    await createReservation(reservation);

    alert("🎉 Reservation Created Successfully!");

    setReservation({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      occasion: "",
      party_size: 2,
      seating: "",
    });

  } catch (error) {
    console.error(error);
    alert("❌ Failed to create reservation");
  }
};

  return (
    <div className="min-h-screen bg-[#050505] text-[#F9F7F3] overflow-x-hidden relative"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Cursor warm glow */}
      <div className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500"
        style={{ background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, ${accent}10, transparent 55%)` }} />

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${navScrolled ? "bg-black/70 backdrop-blur-2xl border-b border-white/[0.04]" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-xl tracking-[0.25em] font-medium cursor-pointer select-none"
            style={{ color: accent, fontFamily: "'Playfair Display', serif", transition: "color 0.4s ease" }}>
            LUMINA
          </div>
          <div className="hidden md:flex items-center gap-9">
            {["Menu", "Chef", "Experience", "Gallery", "Reservations"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-[11px] tracking-[0.22em] text-white/45 hover:text-white/90 transition-colors duration-300 uppercase">
                {item}
              </a>
            ))}
          </div>
          <button
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 hover:brightness-110"
            style={{ border: `1px solid ${accent}70`, color: accent }}
            onClick={() => document.getElementById("reservations")?.scrollIntoView({ behavior: "smooth" })}>
            Reserve
          </button>
          <button className="md:hidden text-white/60 hover:text-white transition-colors"
            onClick={() => setNavOpen(v => !v)}>
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-2xl px-6 pb-8 pt-2 space-y-5">
            {["Menu", "Chef", "Experience", "Gallery", "Reservations"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="block text-[11px] tracking-[0.22em] text-white/45 hover:text-white/80 transition-colors uppercase"
                onClick={() => setNavOpen(false)}>
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" id="experience">
        {/* Parallax bg */}
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.28}px)` }}>
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&auto=format"
            alt="LUMINA fine dining hall" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/30 to-[#050505]" />
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 45% 35%, ${accent}16 0%, transparent 65%)` }} />
        </div>

        {/* Steam particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="absolute bottom-[38%] w-0.5 rounded-full"
              style={{
                left: `${8 + i * 9}%`,
                height: `${50 + i * 15}px`,
                background: `linear-gradient(to top, ${accent}50, transparent)`,
                animation: `steamRise ${3.5 + i * 0.4}s ease-in-out ${i * 0.35}s infinite`,
                opacity: 0,
              }} />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 w-full">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="flex items-center gap-3 mb-9">
              <div className="w-7 h-px transition-all duration-500" style={{ background: accent }} />
              <span className="text-[10px] tracking-[0.35em] uppercase transition-colors duration-500" style={{ color: accent }}>
                Michelin ⭐⭐⭐ · New Delhi
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35 }}
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-light leading-[1.04] mb-8 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Every Meal Is A{" "}
              <em className="italic transition-colors duration-500" style={{ color: accent }}>Story</em>
              <br />Waiting To Be<br />Experienced.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65 }}
              className="text-base md:text-lg text-white/40 mb-12 leading-relaxed max-w-lg">
              AI-powered dining with personalised recommendations, smart reservations, chef experiences and hospitality that anticipates your every desire.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.85 }}
              className="flex flex-wrap gap-4">
              <button
                className="group flex items-center gap-3 px-8 py-4 text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                style={{ background: accent, color: "#050505", boxShadow: `0 8px 32px ${accent}30` }}
                onClick={() => document.getElementById("reservations")?.scrollIntoView({ behavior: "smooth" })}>
                Reserve Experience
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button
                className="flex items-center gap-3 px-8 py-4 text-[11px] tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>
                Explore Menu
              </button>
            </motion.div>
          </div>

          {/* Floating stat cards */}
          <div className="absolute bottom-16 right-6 hidden lg:flex flex-col gap-3">
            {[
              { label: "Google Rating", value: "4.9 ★", sub: "12,400+ reviews" },
              { label: "Michelin Stars", value: "⭐⭐⭐", sub: "3-Star Recognition 2024" },
              { label: "Tonight", value: "4 Tables", sub: "Still available · Book now" },
            ].map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.1 + i * 0.15 }}
                className="px-5 py-4 min-w-[190px]"
                style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(24px)" }}>
                <div className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-1">{card.label}</div>
                <div className="text-xl font-medium mb-0.5 transition-colors duration-500"
                  style={{ fontFamily: "'Playfair Display', serif", color: accent }}>{card.value}</div>
                <div className="text-[10px] text-white/25">{card.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[9px] tracking-[0.35em] text-white/20 uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/15 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ── OCCASION PICKER ─────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel label="Personalise Your Evening" accent={accent} />
            <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              What Brings You Today?
            </h2>
            <p className="mt-3 text-white/30 text-sm max-w-sm mx-auto leading-relaxed">
              Your selection reshapes the entire experience — menu, table, lighting, and more.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {OCCASIONS.map(o => {
              const active = selectedOccasion === o.id;
              return (
                <button key={o.id}
                  onClick={() => setSelectedOccasion(active ? null : o.id)}
                  onMouseEnter={() => setHoveredOccasion(o.id)}
                  onMouseLeave={() => setHoveredOccasion(null)}
                  className="relative p-5 text-left transition-all duration-400 hover:scale-[1.025] group"
                  style={{
                    background: active ? `${o.color}15` : "rgba(255,255,255,0.025)",
                    border: `1px solid ${active ? o.color + "55" : "rgba(255,255,255,0.06)"}`,
                  }}>
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{o.emoji}</div>
                  <div className="text-xs font-medium text-white/70 group-hover:text-white/90 transition-colors">{o.label}</div>
                  {active && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: o.color }} />
                  )}
                </button>
              );
            })}
          </div>

          {selectedOccasion && occ && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="mt-6 p-6"
              style={{ background: `${occ.color}0d`, border: `1px solid ${occ.color}28` }}>
              <div className="flex items-start gap-5">
                <div className="text-3xl flex-shrink-0">{occ.emoji}</div>
                <div>
                  <div className="text-[10px] tracking-[0.28em] uppercase mb-2 transition-colors duration-500" style={{ color: accent }}>
                    Your Personalised Experience
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{occ.message}</p>
                  <button className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase hover:gap-3 transition-all duration-200"
                    style={{ color: accent }}
                    onClick={() => document.getElementById("reservations")?.scrollIntoView({ behavior: "smooth" })}>
                    Reserve This Experience <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── TODAY'S SPECIALS ─────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-px transition-all duration-500" style={{ background: accent }} />
                <span className="text-[10px] tracking-[0.3em] uppercase transition-colors duration-500" style={{ color: accent }}>Tonight Only</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                Chef's Specials
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] text-white/25 tracking-widest uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kitchen Open · Closes 11 pm
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DISHES.mains.map(dish => (
              <div key={dish.id}
                className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.05)" }}
                onMouseEnter={() => setHoveredDish(dish.id)}
                onMouseLeave={() => setHoveredDish(null)}>
                <div className="relative h-52 overflow-hidden bg-[#181818]">
                  <img src={`https://images.unsplash.com/${dish.img}?w=600&h=400&fit=crop&auto=format`}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-85 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 px-2 py-1 text-[9px] tracking-[0.2em] uppercase transition-colors duration-500"
                    style={{ background: `${accent}1a`, border: `1px solid ${accent}35`, color: accent }}>
                    {dish.tag}
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1">
                    <Star size={11} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-white/80">{dish.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-medium mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>{dish.name}</h3>
                  <p className="text-[11px] text-white/35 mb-4 leading-relaxed">{dish.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[9px] text-white/25 tracking-wide">
                      <span className="flex items-center gap-1"><Timer size={9} />{dish.time}</span>
                      <span className="flex items-center gap-1"><Flame size={9} />{dish.cal}</span>
                    </div>
                    <div className="text-base font-medium transition-colors duration-500"
                      style={{ color: accent, fontFamily: "'Playfair Display', serif" }}>{dish.price}</div>
                  </div>
                </div>
                {hoveredDish === dish.id && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: `${accent}12`, backdropFilter: "blur(2px)" }}>
                    <button className="px-6 py-3 text-[10px] tracking-[0.22em] uppercase font-medium transition-all hover:brightness-110"
                      style={{ background: accent, color: "#050505" }}>
                      Add to Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENU ─────────────────────────────────────────── */}
      <section className="py-24 px-6" id="menu">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel label="The Menu" accent={accent} />
            <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              A Journey Through Flavour
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.07] mb-10 overflow-x-auto">
            {(["starters", "mains", "desserts", "wine"] as MenuTab[]).map(tab => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-2 px-6 py-4 text-[10px] tracking-[0.25em] uppercase whitespace-nowrap border-b-2 -mb-px transition-all duration-300"
                style={{
                  borderBottomColor: activeTab === tab ? accent : "transparent",
                  color: activeTab === tab ? accent : "rgba(255,255,255,0.3)",
                }}>
                {tab === "starters" && <UtensilsCrossed size={11} />}
                {tab === "mains" && <Flame size={11} />}
                {tab === "desserts" && <Heart size={11} />}
                {tab === "wine" && <Wine size={11} />}
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DISHES[activeTab].map((dish, i) => (
              <motion.div key={dish.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: i * 0.08 }}
                className="group overflow-hidden transition-all duration-400 hover:scale-[1.02]"
                style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="relative h-44 overflow-hidden bg-[#181818]">
                  <img src={`https://images.unsplash.com/${dish.img}?w=500&h=350&fit=crop&auto=format`}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-[11px] text-white/75">{dish.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="inline-block px-2 py-0.5 text-[8px] tracking-[0.2em] uppercase mb-2 transition-colors duration-500"
                    style={{ background: `${accent}12`, color: accent }}>
                    {dish.tag}
                  </div>
                  <h3 className="text-sm font-medium mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{dish.name}</h3>
                  <p className="text-[11px] text-white/30 mb-4 leading-relaxed">{dish.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-white/20 flex items-center gap-1"><Timer size={9} />{dish.time}</div>
                    <div className="text-sm font-medium transition-colors duration-500" style={{ color: accent }}>{dish.price}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHEF'S STORY ────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden" id="chef">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 0% 50%, ${accent}0b, transparent 55%)` }} />
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative overflow-hidden bg-[#181818] aspect-[3/4] max-w-sm">
                <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=800&fit=crop&auto=format"
                  alt="Head Chef Arjun Mehta" className="w-full h-full object-cover opacity-85" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-[9px] tracking-[0.3em] uppercase text-white/35 mb-1">Head Chef</div>
                  <div className="text-lg font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Arjun Mehta</div>
                  <div className="text-[10px] text-white/30 mt-1">Le Bernardin · Noma · El Celler de Can Roca</div>
                </div>
              </div>
              <div className="absolute -right-2 top-10 p-4"
                style={{ background: "rgba(14,14,14,0.95)", border: `1px solid ${accent}25`, backdropFilter: "blur(20px)" }}>
                <Award size={18} className="mb-2 transition-colors duration-500" style={{ color: accent }} />
                <div className="text-[9px] text-white/35 mb-0.5">Michelin</div>
                <div className="text-sm font-medium transition-colors duration-500" style={{ color: accent }}>⭐⭐⭐</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-px transition-colors duration-500" style={{ background: accent }} />
                <span className="text-[10px] tracking-[0.3em] uppercase transition-colors duration-500" style={{ color: accent }}>The Visionary</span>
              </div>
              <h2 className="text-4xl md:text-[2.8rem] font-light mb-8 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Food Is My Language.<br />
                <em className="italic transition-colors duration-500" style={{ color: accent }}>The Plate Is My Canvas.</em>
              </h2>
              <p className="text-sm text-white/45 leading-relaxed mb-5">
                With 18 years across three continents, Chef Arjun Mehta brings the precision of French technique to the soul of Indian cuisine. Every dish at LUMINA is his autobiography — written in flavour, texture, and time.
              </p>
              <p className="text-sm text-white/45 leading-relaxed mb-10">
                "I want guests to leave not just satisfied, but transformed. A single bite should transport you — to your grandmother's kitchen, to a summer in Provence, to something entirely new."
              </p>
              <div className="grid grid-cols-3 gap-8">
                {[{ v: "18+", l: "Years Experience" }, { v: "3", l: "Michelin Stars" }, { v: "47", l: "Awards Won" }].map(s => (
                  <div key={s.l}>
                    <div className="text-2xl font-medium mb-1 transition-colors duration-500"
                      style={{ color: accent, fontFamily: "'Playfair Display', serif" }}>{s.v}</div>
                    <div className="text-[10px] text-white/30 tracking-wide">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── JOURNEY ──────────────────────────────────────── */}
      <section className="py-24 px-6" ref={journeyRef}>
        <div className="max-w-3xl mx-auto text-center mb-16">
          <SectionLabel label="Farm to Table" accent={accent} />
          <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Story Behind Every Bite
          </h2>
        </div>
        <div className="max-w-5xl mx-auto relative">
          <div className="absolute top-11 left-12 right-12 h-px hidden md:block"
            style={{ background: `linear-gradient(to right, transparent, ${accent}25, transparent)` }} />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {JOURNEY.map((step, i) => (
              <div key={i} data-step={i} className="text-center transition-all duration-700"
                style={{
                  opacity: visibleSteps.includes(i) ? 1 : 0,
                  transform: visibleSteps.includes(i) ? "translateY(0)" : "translateY(24px)",
                  transitionDelay: `${i * 140}ms`,
                }}>
                <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center text-3xl relative transition-all duration-500"
                  style={{ background: `${accent}0d`, border: `1px solid ${accent}20` }}>
                  {step.icon}
                </div>
                <div className="text-sm font-medium mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{step.label}</div>
                <div className="text-[11px] text-white/30 leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESERVATIONS ─────────────────────────────────── */}
      <section className="py-24 px-6" id="reservations">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel label="Reserve Your Evening" accent={accent} />
            <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              Secure Your Table
            </h2>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-3 mb-12">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-400"
                  style={{
                    background: step <= reserveStep ? accent : "rgba(255,255,255,0.06)",
                    color: step <= reserveStep ? "#050505" : "rgba(255,255,255,0.25)",
                    border: `1px solid ${step <= reserveStep ? accent : "rgba(255,255,255,0.1)"}`,
                  }}>
                  {step < reserveStep ? <Check size={12} /> : step}
                </div>
                {step < 3 && (
                  <div className="w-14 h-px transition-all duration-400"
                    style={{ background: step < reserveStep ? accent : "rgba(255,255,255,0.08)" }} />
                )}
              </div>
            ))}
          </div>

          <div className="p-8 md:p-10"
            style={{ background: "#0b0b0b", border: "1px solid rgba(255,255,255,0.05)" }}>

            {reserveStep === 1 && (
              <div>
                <h3 className="text-lg font-medium mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Occasion & Party Size
                </h3>
                <p className="text-xs text-white/30 mb-7">Tell us what you're celebrating so we can prepare accordingly.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {OCCASIONS.slice(0, 4).map(o => (
                    <button key={o.id}
                      onClick={() => {
  setSelectedOccasion(o.id);

  setReservation({
    ...reservation,
    occasion: o.id,
  });
}}
                      className="p-4 text-left transition-all duration-300 hover:scale-[1.03]"
                      style={{
                        background: selectedOccasion === o.id ? `${o.color}12` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${selectedOccasion === o.id ? o.color + "45" : "rgba(255,255,255,0.06)"}`,
                      }}>
                      <div className="text-2xl mb-2">{o.emoji}</div>
                      <div className="text-[10px] text-white/50">{o.label}</div>
                    </button>
                  ))}
                </div>

                <div className="mb-8">
                  <div className="text-[9px] text-white/30 tracking-[0.28em] uppercase mb-3">Party Size</div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <button key={n}
                       onClick={() => {
    setPartySize(n);

    setReservation({
        ...reservation,
        party_size: n,
    });
}}
                        className="w-10 h-10 text-sm transition-all duration-200 hover:scale-110"
                        style={{
                          background: partySize === n ? `${accent}18` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${partySize === n ? accent + "50" : "rgba(255,255,255,0.08)"}`,
                          color: partySize === n ? accent : "rgba(255,255,255,0.45)",
                        }}>
                        {n}
                      </button>
                    ))}
                    <button className="px-3 h-10 text-[10px] transition-all duration-200 hover:scale-110"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
                      9+
                    </button>
                  </div>
                </div>

                <button onClick={() => setReserveStep(2)}
                  className="w-full py-4 text-[11px] tracking-[0.22em] uppercase font-medium transition-all duration-300 hover:brightness-110"
                  style={{ background: accent, color: "#050505" }}>
                  Continue → Choose Seating
                </button>
              </div>
            )}

            {reserveStep === 2 && (
              <div>
                <h3 className="text-lg font-medium mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Select Your Table</h3>
                <p className="text-[11px] text-white/30 mb-6 flex items-center gap-2">
                  <Sparkles size={10} className="transition-colors duration-500" style={{ color: accent }} />
                  AI recommends{" "}
                  <span className="transition-colors duration-500" style={{ color: accent }}>
                    {selectedOccasion === "romantic" ? "Window Seating" : selectedOccasion === "corporate" ? "Private Dining" : "Garden Seating"}
                  </span>
                  {" "}for your{" "}
                  {occ?.label.toLowerCase() ?? "evening"}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                  {SEATINGS.map(seat => (
                    <button key={seat.id}
                      onClick={() => {
    setSelectedSeating(seat.id);

    setReservation({
        ...reservation,
        seating: seat.id,
    });
}}
                      className="p-4 text-left transition-all duration-300 hover:scale-[1.03]"
                      style={{
                        background: selectedSeating === seat.id ? `${accent}10` : "rgba(255,255,255,0.025)",
                        border: `1px solid ${selectedSeating === seat.id ? accent + "45" : "rgba(255,255,255,0.06)"}`,
                      }}>
                      <div className="text-2xl mb-2">{seat.emoji}</div>
                      <div className="text-xs font-medium text-white/70 mb-0.5">{seat.label}</div>
                      <div className="text-[9px] text-white/25 mb-2">{seat.desc}</div>
                      <div className="text-[9px] transition-colors duration-500" style={{ color: accent }}>{seat.available}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setReserveStep(1)}
                    className="px-6 py-4 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors">
                    ← Back
                  </button>
                  <button onClick={() => setReserveStep(3)}
                    className="flex-1 py-4 text-[11px] tracking-[0.22em] uppercase font-medium transition-all hover:brightness-110"
                    style={{ background: accent, color: "#050505" }}>
                    Continue → Date & Time
                  </button>
                </div>
              </div>
            )}

            {reserveStep === 3 && (
              <div>
                <h3 className="text-lg font-medium mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Confirm Your Reservation</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  {[
                    { label: "Full Name", placeholder: "Your full name", type: "text" },
                    { label: "Email Address", placeholder: "your@email.com", type: "email" },
                    { label: "Phone Number", placeholder: "+91 98765 43210", type: "tel" },
                    { label: "Preferred Date", placeholder: "", type: "date" },
                  ].map(field => (
                    <div key={field.label}>
                      <div className="text-[9px] tracking-[0.28em] uppercase text-white/30 mb-2">{field.label}</div>
                      <input
  type={field.type}
  placeholder={field.placeholder}
  className="w-full px-4 py-3 text-sm text-white placeholder-white/15 transition-all duration-200 outline-none"
  style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
  }}
  value={
    field.label === "Full Name"
      ? reservation.name
      : field.label === "Email Address"
      ? reservation.email
      : field.label === "Phone Number"
      ? reservation.phone
      : reservation.date
  }
  onChange={(e) => {
    if (field.label === "Full Name") {
      setReservation({ ...reservation, name: e.target.value });
    } else if (field.label === "Email Address") {
      setReservation({ ...reservation, email: e.target.value });
    } else if (field.label === "Phone Number") {
      setReservation({ ...reservation, phone: e.target.value });
    } else if (field.label === "Preferred Date") {
      setReservation({ ...reservation, date: e.target.value });
    }
  }}
  onFocus={(e) => {
    e.target.style.borderColor = `${accent}50`;
  }}
  onBlur={(e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.07)";
  }}
/>
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <div className="text-[9px] tracking-[0.28em] uppercase text-white/30 mb-3">Preferred Time</div>
                  <div className="flex flex-wrap gap-2">
                    {["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM"].map(t => (
                      <button key={t}
                       onClick={() => {
  setSelectedTime(t);
  setReservation({
    ...reservation,
    time: t,
  });
}}
                        className="px-4 py-2 text-[10px] tracking-wide transition-all duration-200 hover:scale-105"
                        style={{
                          background: selectedTime === t ? `${accent}15` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${selectedTime === t ? accent + "45" : "rgba(255,255,255,0.07)"}`,
                          color: selectedTime === t ? accent : "rgba(255,255,255,0.35)",
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setReserveStep(2)}
                    className="px-6 py-4 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors">
                    ← Back
                  </button>
                  <button
                     className="flex-1 py-4 text-[11px] tracking-[0.22em] uppercase font-medium transition-all hover:brightness-110"
                     style={{ background: accent, color: "#050505" }}
                    onClick={handleReservation}>
                         Complete Reservation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden" ref={statsRef}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${accent}07, transparent 60%)` }} />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel label="By the Numbers" accent={accent} />
            <h2 className="text-4xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              A Legacy of Excellence
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <StatCounter key={i} stat={stat} active={statsVisible} accent={accent} />
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────── */}
      <section className="py-20 px-6" id="gallery">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel label="The World of LUMINA" accent={accent} />
            <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              A Glimpse Inside
            </h2>
          </div>
          <div className="grid grid-cols-3 grid-rows-2 gap-2 h-[480px]">
            {GALLERY.map((item, i) => (
              <div key={i}
                className={`relative overflow-hidden cursor-pointer group bg-[#181818] ${item.col}`}
                onMouseEnter={() => setGalleryHover(i)}
                onMouseLeave={() => setGalleryHover(null)}>
                <img src={`https://images.unsplash.com/${item.img}?w=800&h=600&fit=crop&auto=format`}
                  alt={item.label}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-75 group-hover:opacity-95" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300"
                  style={{ opacity: galleryHover === i ? 1 : 0.2 }} />
                <div className="absolute bottom-4 left-4 transition-all duration-300"
                  style={{ opacity: galleryHover === i ? 1 : 0, transform: `translateY(${galleryHover === i ? 0 : 10}px)` }}>
                  <div className="text-sm font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel label="The Verdict" accent={accent} />
            <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              Words From Our Guests
            </h2>
          </div>

          <div className="relative">
            <motion.div key={reviewIdx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="p-8 md:p-10"
              style={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-start gap-6">
                <img src={`https://images.unsplash.com/${REVIEWS[reviewIdx].img}?w=80&h=80&fit=crop&auto=format`}
                  alt={REVIEWS[reviewIdx].name}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0 opacity-90" />
                <div>
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-base md:text-lg text-white/60 leading-relaxed mb-6 italic"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{REVIEWS[reviewIdx].text}"
                  </p>
                  <div>
                    <div className="text-sm font-medium">{REVIEWS[reviewIdx].name}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">{REVIEWS[reviewIdx].role}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-5 mt-7">
              <button onClick={() => setReviewIdx((reviewIdx - 1 + REVIEWS.length) % REVIEWS.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}>
                <ChevronLeft size={15} />
              </button>
              <div className="flex gap-2">
                {REVIEWS.map((_, i) => (
                  <button key={i}
                    onClick={() => setReviewIdx(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300 hover:scale-125"
                    style={{ background: i === reviewIdx ? accent : "rgba(255,255,255,0.18)" }} />
                ))}
              </div>
              <button onClick={() => setReviewIdx((reviewIdx + 1) % REVIEWS.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="text-xl tracking-[0.25em] font-medium mb-4 transition-colors duration-500"
                style={{ color: accent, fontFamily: "'Playfair Display', serif" }}>LUMINA</div>
              <p className="text-[11px] text-white/25 leading-relaxed mb-6">
                Dining Beyond Imagination. Where every meal becomes a story, and every story becomes a memory to carry for life.
              </p>
              <div className="flex gap-3">
                {[Instagram, Globe, Phone].map((Icon, i) => (
                  <a key={i} href="#"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>
                    <Icon size={13} />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: "Experience", links: ["Our Menu", "Chef's Table", "Private Dining", "Wine Cellar", "Events"] },
              { title: "Visit", links: ["Reservations", "Group Bookings", "Gift Vouchers", "Loyalty Club"] },
              { title: "Connect", links: ["+91 11 4567 8900", "hello@lumina.in", "12 Mehrauli Road, New Delhi", "Mon–Sun: 7pm–midnight"] },
            ].map(col => (
              <div key={col.title}>
                <div className="text-[9px] tracking-[0.28em] uppercase mb-5 transition-colors duration-500" style={{ color: accent }}>{col.title}</div>
                <div className="space-y-3">
                  {col.links.map(link => (
                    <a key={link} href="#" className="block text-[11px] text-white/25 hover:text-white/55 transition-colors">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.04]">
            <div className="text-[9px] text-white/15 tracking-wide">© 2024 LUMINA. All rights reserved. Michelin ⭐⭐⭐ Recognised. Awwwards Site of the Year.</div>
            <button
              className="px-7 py-3 text-[10px] tracking-[0.22em] uppercase transition-all hover:scale-105"
              style={{ border: `1px solid ${accent}45`, color: accent }}
              onClick={() => document.getElementById("reservations")?.scrollIntoView({ behavior: "smooth" })}>
              Reserve Tonight
            </button>
          </div>
        </div>
      </footer>

      {/* ── AI CONCIERGE WIDGET ──────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {conciergeOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4 w-80 md:w-[22rem] overflow-hidden shadow-2xl"
            style={{ background: "#0d0d0d", border: `1px solid ${accent}22`, backdropFilter: "blur(24px)" }}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/[0.04]"
              style={{ background: `${accent}08` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `${accent}18` }}>
                  <Sparkles size={13} className="transition-colors duration-500" style={{ color: accent }} />
                </div>
                <div>
                  <div className="text-xs font-medium">LUMINA Concierge</div>
                  <div className="text-[9px] text-white/25 flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    AI-powered · Always available
                  </div>
                </div>
              </div>
              <button onClick={() => setConciergeOpen(false)}
                className="text-white/25 hover:text-white/60 transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-60 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[88%] px-3.5 py-3 text-[11px] leading-relaxed"
                    style={{
                      background: msg.role === "ai" ? "rgba(255,255,255,0.04)" : `${accent}18`,
                      border: `1px solid ${msg.role === "ai" ? "rgba(255,255,255,0.05)" : accent + "28"}`,
                      color: msg.role === "ai" ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.88)",
                    }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 flex items-center gap-1.5"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/35 animate-bounce"
                        style={{ animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {["Romantic dinner", "Birthday", "Wine pairing", "Vegetarian"].map(p => (
                <button key={p}
                  onClick={() => quickPrompt(p)}
                  className="flex-shrink-0 px-2.5 py-1.5 rounded-full text-[8px] tracking-wide transition-all hover:scale-105"
                  style={{ background: `${accent}12`, border: `1px solid ${accent}25`, color: accent }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 flex gap-2 border-t border-white/[0.04]">
              <input type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask your concierge..."
                className="flex-1 px-3 py-2.5 text-[11px] text-white placeholder-white/18 outline-none transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                onFocus={e => { e.target.style.borderColor = `${accent}45`; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; }} />
              <button onClick={sendMessage}
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center transition-all hover:scale-110 hover:brightness-110"
                style={{ background: accent }}>
                <Send size={12} style={{ color: "#050505" }} />
              </button>
            </div>
          </motion.div>
        )}

        <button onClick={() => setConciergeOpen(v => !v)}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-350 hover:scale-110"
          style={{
            background: conciergeOpen ? "#111" : accent,
            border: `2px solid ${accent}`,
            boxShadow: `0 0 28px ${accent}35`,
          }}>
          {conciergeOpen
            ? <X size={17} style={{ color: accent }} />
            : <Sparkles size={17} style={{ color: "#050505" }} />}
        </button>
      </div>

      {/* ── Global keyframes ─────────────────────────────── */}
      <style>{`
        @keyframes steamRise {
          0%   { opacity: 0; transform: translateY(0) scaleX(1); }
          15%  { opacity: 0.55; }
          85%  { opacity: 0.08; }
          100% { opacity: 0; transform: translateY(-90px) scaleX(1.8); }
        }
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
