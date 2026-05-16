import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Phone, Clock, ChevronRight, UtensilsCrossed,
  Flame, Leaf, Fish, Calendar, Mail, Instagram,
  Facebook, ArrowUp, Menu, X, Check, Sparkles
} from 'lucide-react';

/* ─── Animated section wrapper ─── */
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

/* ─── Types ─── */
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_featured: boolean;
}

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  review: string;
  avatar_url: string;
}

/* ─── Category icons mapping ─── */
const categoryIcons: Record<string, string> = {
  'المقبلات': '🥟',
  'الشوربات': '🍲',
  'المشاوي البحرية': '🦐',
  'أطباق الأرز': '🍚',
  'سيزلرز ومخبوزات التندور': '🫓',
  'أطباق متنوعة': '✨',
};

/* ─── Main App ─── */
export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reservationStatus, setReservationStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', guests: '2', meal_type: '' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, testRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/testimonials'),
        ]);
        const menuData = await menuRes.json();
        const testData = await testRes.json();
        setMenuItems(menuData);
        setTestimonials(testData);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const categories = ['all', ...Array.from(new Set(menuItems.map(i => i.category)))];
  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter(i => i.category === activeCategory);

  const groupedByCategory = categories.filter(c => c !== 'all').map(cat => ({
    category: cat,
    items: menuItems.filter(i => i.category === cat),
  }));

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setReservationStatus('submitting');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setReservationStatus('success');
        setForm({ name: '', email: '', phone: '', date: '', time: '', guests: '2', meal_type: '' });
        setTimeout(() => setReservationStatus('idle'), 4000);
      } else {
        setReservationStatus('error');
      }
    } catch {
      setReservationStatus('error');
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-white font-sans">
      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0C0A09]/95 backdrop-blur-lg shadow-2xl shadow-black/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A24E] to-[#C2571A] flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-[#D4A24E] to-[#F0C878] bg-clip-text text-transparent">As-Safir</span>
            </button>
            <div className="hidden md:flex items-center gap-8">
              {['About', 'Menu', 'Reviews', 'Reserve'].map(item => (
                <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-sm uppercase tracking-[0.2em] text-stone-400 hover:text-[#D4A24E] transition-colors duration-300">
                  {item}
                </button>
              ))}
              <button onClick={() => scrollTo('reserve')} className="ml-4 px-6 py-2.5 bg-gradient-to-r from-[#D4A24E] to-[#C2571A] text-white text-sm uppercase tracking-wider rounded-full hover:shadow-lg hover:shadow-[#D4A24E]/25 transition-all duration-300 hover:scale-105">
                Book a Table
              </button>
            </div>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-stone-300">
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0C0A09]/98 backdrop-blur-xl border-t border-stone-800"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                {['About', 'Menu', 'Reviews', 'Reserve'].map(item => (
                  <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-left text-lg text-stone-300 hover:text-[#D4A24E] transition-colors">
                    {item}
                  </button>
                ))}
                <button onClick={() => scrollTo('reserve')} className="mt-2 px-6 py-3 bg-gradient-to-r from-[#D4A24E] to-[#C2571A] text-white rounded-full text-center">
                  Book a Table
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/uploads/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C0A09]/70 via-[#0C0A09]/50 to-[#0C0A09]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C0A09]/60 to-transparent" />
        </div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#D4A24E]/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-[#C2571A]/5 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4A24E]/30 bg-[#D4A24E]/10 mb-8">
              <Sparkles className="w-4 h-4 text-[#D4A24E]" />
              <span className="text-[#D4A24E] text-sm tracking-[0.2em] uppercase">Premium Indian Dining</span>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold leading-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-stone-200 to-stone-400 bg-clip-text text-transparent">The Art of</span>
            <br />
            <span className="bg-gradient-to-r from-[#D4A24E] via-[#F0C878] to-[#D4A24E] bg-clip-text text-transparent">Indian Cuisine</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-stone-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Experience the rich flavors and timeless traditions of India, right in the heart of Tripoli. Every dish tells a story of heritage, spice, and soul.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={() => scrollTo('reserve')} className="group px-8 py-4 bg-gradient-to-r from-[#D4A24E] to-[#C2571A] text-white rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-[#D4A24E]/30 transition-all duration-300 hover:scale-105 flex items-center gap-2">
              Reserve Your Table
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => scrollTo('menu')} className="px-8 py-4 border border-stone-600 text-stone-300 rounded-full text-lg font-semibold hover:border-[#D4A24E] hover:text-[#D4A24E] transition-all duration-300">
              Explore Menu
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { val: '15+', label: 'Years' },
              { val: '40+', label: 'Dishes' },
              { val: '4.9', label: 'Rating' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-[#D4A24E]">{s.val}</div>
                <div className="text-sm text-stone-500 uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-stone-600 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-[#D4A24E]" />
          </div>
        </motion.div>
      </section>

      {/* ── ABOUT ── */}
      <Section id="about" className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#D4A24E]/5 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                <img src="/uploads/about-interior.jpg" alt="As-Safir Interior" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09]/40 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -right-4 sm:right-6 bg-[#1A1714] border border-stone-800 rounded-xl p-5 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A24E] to-[#C2571A] flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold">Authentic Tandoor</div>
                    <div className="text-stone-400 text-sm">Clay oven tradition</div>
                  </div>
                </div>
              </motion.div>
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#D4A24E]/30 rounded-tl-2xl" />
            </div>

            <div>
              <span className="text-[#D4A24E] text-sm uppercase tracking-[0.3em] font-semibold">Our Story</span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6 leading-tight">
                <span className="text-white">A Culinary Journey</span><br />
                <span className="bg-gradient-to-r from-[#D4A24E] to-[#F0C878] bg-clip-text text-transparent">From India to Tripoli</span>
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed mb-6">
                Founded in 2009, As-Safir brings the authentic flavors of India's diverse culinary landscape to the heart of Tripoli. Our master chefs, trained in the royal kitchens of Lucknow and the coastal traditions of Kerala, craft each dish with passion and precision.
              </p>
              <p className="text-stone-400 text-lg leading-relaxed mb-8">
                From the smoky depths of our traditional tandoor to the fragrant biryanis slow-cooked to perfection, every plate is a celebration of India's rich gastronomic heritage — reimagined for the discerning palate.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Flame, title: 'Tandoor Fresh', desc: 'Clay oven specialties' },
                  { icon: Leaf, title: 'Fresh Spices', desc: 'Imported from India' },
                  { icon: UtensilsCrossed, title: 'Royal Recipes', desc: 'Heritage cuisine' },
                  { icon: Fish, title: 'Coastal Flavors', desc: 'Seafood delicacies' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D4A24E]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-5 h-5 text-[#D4A24E]" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{item.title}</div>
                      <div className="text-stone-500 text-xs">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── MENU ── */}
      <Section id="menu" className="py-24 sm:py-32 bg-[#100E0C] relative">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A24E 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#D4A24E] text-sm uppercase tracking-[0.3em] font-semibold">Our Menu</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4">
              <span className="bg-gradient-to-r from-[#D4A24E] to-[#F0C878] bg-clip-text text-transparent">قائمة الطعام</span>
            </h2>
            <p className="text-stone-400 mt-4 max-w-xl mx-auto">كل طبق تحفة فنية، محضّر بأجود التوابل المستوردة وتقنيات أصيلة متوارثة عبر الأجيال</p>
          </div>

          {/* Category tabs */}
          <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-4 mb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shrink-0 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#D4A24E] to-[#C2571A] text-white shadow-lg shadow-[#D4A24E]/20'
                    : 'bg-stone-800/50 text-stone-400 hover:bg-stone-700/50 hover:text-white'
                }`}
              >
                {cat === 'all' ? '📋 الكل' : `${categoryIcons[cat] || '🍽️'} ${cat}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-[#1A1714] rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-stone-800" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-stone-800 rounded w-2/3" />
                    <div className="h-3 bg-stone-800 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeCategory === 'all' ? (
            /* ── ALL CATEGORIES VIEW ── */
            <div className="space-y-16">
              {groupedByCategory.map((group, gi) => (
                <motion.div
                  key={group.category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{categoryIcons[group.category] || '🍽️'}</span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">{group.category}</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-stone-700 to-transparent ml-4" />
                    <span className="text-stone-500 text-sm">{group.items.length} {group.items.length === 1 ? 'طبق' : 'أطباق'}</span>
                  </div>
                  {/* Items grid with individual images */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.items.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-[#1A1714] rounded-xl overflow-hidden border border-stone-800/40 hover:border-[#D4A24E]/30 transition-all duration-500 hover:shadow-lg hover:shadow-[#D4A24E]/5"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-transparent to-transparent" />
                          <div className="absolute bottom-3 right-3 px-3 py-1 bg-[#D4A24E]/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                            {item.price} د.ل
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-white font-bold text-base group-hover:text-[#D4A24E] transition-colors">{item.name}</h4>
                          <p className="text-stone-500 text-xs mt-1 line-clamp-1">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* ── SINGLE CATEGORY VIEW ── */
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{categoryIcons[activeCategory] || '🍽️'}</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">{activeCategory}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-stone-700 to-transparent ml-4" />
                <span className="text-stone-500 text-sm">{filtered.length} {filtered.length === 1 ? 'طبق' : 'أطباق'}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-[#1A1714] rounded-xl overflow-hidden border border-stone-800/40 hover:border-[#D4A24E]/30 transition-all duration-500 hover:shadow-lg hover:shadow-[#D4A24E]/5"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-transparent to-transparent" />
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-[#D4A24E]/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                        {item.price} د.ل
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-white font-bold text-base group-hover:text-[#D4A24E] transition-colors">{item.name}</h4>
                      <p className="text-stone-500 text-xs mt-1 line-clamp-1">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section id="reviews" className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A24E]/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#D4A24E] text-sm uppercase tracking-[0.3em] font-semibold">Testimonials</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4">
              <span className="bg-gradient-to-r from-[#D4A24E] to-[#F0C878] bg-clip-text text-transparent">What Our Guests Say</span>
            </h2>
          </div>

          {loading ? (
            <div className="max-w-2xl mx-auto bg-[#1A1714] rounded-2xl p-8 animate-pulse">
              <div className="h-4 bg-stone-800 rounded w-3/4 mb-4" />
              <div className="h-4 bg-stone-800 rounded w-full mb-4" />
              <div className="h-4 bg-stone-800 rounded w-1/2" />
            </div>
          ) : testimonials.length > 0 ? (
            <div className="relative max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#1A1714] rounded-2xl p-8 sm:p-12 border border-stone-800/50 text-center"
                >
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < testimonials[currentTestimonial].rating ? 'text-[#D4A24E] fill-[#D4A24E]' : 'text-stone-700'}`} />
                    ))}
                  </div>
                  <p className="text-stone-300 text-lg sm:text-xl leading-relaxed italic mb-8">"{testimonials[currentTestimonial].review}"</p>
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={testimonials[currentTestimonial].avatar_url}
                      alt={testimonials[currentTestimonial].name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#D4A24E]/30"
                    />
                    <div className="text-left">
                      <div className="text-white font-bold">{testimonials[currentTestimonial].name}</div>
                      <div className="text-stone-500 text-sm">Verified Guest</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'bg-[#D4A24E] w-8' : 'bg-stone-700 hover:bg-stone-500'}`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      {/* ── RESERVATION ── */}
      <Section id="reserve" className="py-24 sm:py-32 bg-[#100E0C] relative">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A24E 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-[#D4A24E] text-sm uppercase tracking-[0.3em] font-semibold">Reservation</span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6 leading-tight">
                <span className="text-white">Book Your</span><br />
                <span className="bg-gradient-to-r from-[#D4A24E] to-[#F0C878] bg-clip-text text-transparent">Dining Experience</span>
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed mb-10">
                Reserve your table and let us prepare an unforgettable evening of flavors, aromas, and warm Indian hospitality.
              </p>
              <div className="space-y-6">
                {[
                  { icon: MapPin, label: 'Location', value: 'Al-Sarraj Street, Tripoli, Libya' },
                  { icon: Phone, label: 'Phone', value: '+218 91 234 5678' },
                  { icon: Mail, label: 'Email', value: 'reserve@as-safir.ly' },
                  { icon: Clock, label: 'Hours', value: 'Daily 12:00 PM – 11:00 PM' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#D4A24E]/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-[#D4A24E]" />
                    </div>
                    <div>
                      <div className="text-stone-500 text-sm">{item.label}</div>
                      <div className="text-white font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex gap-4">
                {[Instagram, Facebook].map((Icon, i) => (
                  <a key={i} href="#" className="w-11 h-11 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-[#D4A24E] hover:text-white transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-[#1A1714] rounded-2xl p-8 sm:p-10 border border-stone-800/50 shadow-2xl">
              {reservationStatus === 'success' ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">تم تأكيد الحجز!</h3>
                  <p className="text-stone-400">نتطلع لاستقبالك. سيتم إرسال تأكيد قريباً.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleReservation} className="space-y-5">
                  <h3 className="text-2xl font-bold text-white mb-2">احجز طاولتك</h3>
                  <p className="text-stone-500 text-sm mb-6">أدخل البيانات وسنؤكد حجزك</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-stone-400 text-sm mb-1.5 block">الاسم الكامل *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:border-[#D4A24E] focus:ring-1 focus:ring-[#D4A24E] outline-none transition-all"
                        placeholder="اسمك"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 text-sm mb-1.5 block">رقم الهاتف *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:border-[#D4A24E] focus:ring-1 focus:ring-[#D4A24E] outline-none transition-all"
                        placeholder="+218 XX XXX XXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-stone-400 text-sm mb-1.5 block">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:border-[#D4A24E] focus:ring-1 focus:ring-[#D4A24E] outline-none transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 text-sm mb-1.5 block">نوع الوجبة *</label>
                    <select
                      required
                      value={form.meal_type}
                      onChange={e => setForm({ ...form, meal_type: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-[#D4A24E] focus:ring-1 focus:ring-[#D4A24E] outline-none transition-all"
                    >
                      <option value="">اختر نوع الوجبة</option>
                      <option value="غداء">🍽️ غداء</option>
                      <option value="عشاء">🌙 عشاء</option>
                      <option value="مقبلات فقط">🥟 مقبلات فقط</option>
                      <option value="مأكولات بحرية">🦐 مأكولات بحرية</option>
                      <option value="برياني وأرز">🍚 برياني وأرز</option>
                      <option value="سيزلر">🔥 سيزلر</option>
                      <option value="نباتي">🌿 نباتي</option>
                      <option value="وجبة أطفال">👶 وجبة أطفال</option>
                    </select>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-stone-400 text-sm mb-1.5 block">التاريخ *</label>
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-[#D4A24E] focus:ring-1 focus:ring-[#D4A24E] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 text-sm mb-1.5 block">الوقت *</label>
                      <select
                        required
                        value={form.time}
                        onChange={e => setForm({ ...form, time: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-[#D4A24E] focus:ring-1 focus:ring-[#D4A24E] outline-none transition-all"
                      >
                        <option value="">اختر</option>
                        {['12:00','12:30','13:00','13:30','14:00','14:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-stone-400 text-sm mb-1.5 block">عدد الأشخاص *</label>
                      <select
                        required
                        value={form.guests}
                        onChange={e => setForm({ ...form, guests: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-[#D4A24E] focus:ring-1 focus:ring-[#D4A24E] outline-none transition-all"
                      >
                        {[1,2,3,4,5,6,7,8,10,12,15,20].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'شخص' : 'أشخاص'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {reservationStatus === 'error' && (
                    <p className="text-red-400 text-sm">حدث خطأ. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.</p>
                  )}
                  <button
                    type="submit"
                    disabled={reservationStatus === 'submitting'}
                    className="w-full py-4 bg-gradient-to-r from-[#D4A24E] to-[#C2571A] text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-[#D4A24E]/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {reservationStatus === 'submitting' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري التأكيد...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        تأكيد الحجز
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── CTA BANNER ── */}
      <Section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/uploads/cta-bg.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0C0A09]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#C2571A]/20 to-[#D4A24E]/20" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">Ready for an Unforgettable Meal?</h2>
          <p className="text-stone-300 text-lg mb-10 max-w-2xl mx-auto">Join us for an evening of exquisite Indian cuisine, warm hospitality, and memories that linger like the aroma of freshly ground spices.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => scrollTo('reserve')} className="group px-8 py-4 bg-gradient-to-r from-[#D4A24E] to-[#C2571A] text-white rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-[#D4A24E]/30 transition-all duration-300 hover:scale-105 flex items-center gap-2">
              Reserve Now
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="tel:+218912345678" className="px-8 py-4 border border-white/30 text-white rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call Us
            </a>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080706] py-16 border-t border-stone-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A24E] to-[#C2571A] flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#D4A24E] to-[#F0C878] bg-clip-text text-transparent">As-Safir</span>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed">Premium Indian dining in the heart of Tripoli. Where tradition meets taste.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {['About', 'Menu', 'Reviews', 'Reserve'].map(item => (
                  <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="block text-stone-500 hover:text-[#D4A24E] text-sm transition-colors">{item}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Hours</h4>
              <div className="space-y-2 text-sm text-stone-500">
                <p>Mon – Thu: 12 PM – 10 PM</p>
                <p>Fri – Sat: 12 PM – 11 PM</p>
                <p>Sunday: 1 PM – 10 PM</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-stone-500">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Al-Sarraj St, Tripoli</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +218 91 234 5678</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> reserve@as-safir.ly</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-stone-600 text-sm">© {new Date().getFullYear()} As-Safir. All rights reserved.</p>
            <div className="flex gap-4">
              {[Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="text-stone-600 hover:text-[#D4A24E] transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── SCROLL TO TOP ── */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-[#D4A24E] to-[#C2571A] text-white flex items-center justify-center shadow-lg shadow-[#D4A24E]/25 hover:scale-110 transition-transform"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
