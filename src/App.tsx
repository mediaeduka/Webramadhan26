/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Calendar, 
  BookOpen, 
  UserCheck, 
  Settings, 
  Clock, 
  Menu, 
  X,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  FileText,
  Star,
  Library,
  Video,
  Gamepad2,
  Heart,
  Lock,
  User,
  Trophy,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Beranda', path: '/', icon: HomeIcon },
    { name: 'Program', path: '/program', icon: Star },
    { name: 'Jadwal', path: '/jadwal', icon: Calendar },
    { name: 'Materi', path: '/materi', icon: Library },
    { name: 'Jurnal Siswa', path: '/jurnal-siswa', icon: BookOpen },
    { name: 'Menu Guru', path: '/guru', icon: Settings },
  ];

  return (
    <nav className="bg-emerald-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white p-1 rounded-full">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">G</div>
              </div>
              <span className="font-bold text-lg hidden sm:block">Ramadhan Galuh 1447H</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1",
                    location.pathname === item.path 
                      ? "bg-emerald-700 text-white" 
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  )}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-emerald-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2",
                    location.pathname === item.path 
                      ? "bg-emerald-700 text-white" 
                      : "text-emerald-100 hover:bg-emerald-700 hover:text-white"
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    let totalMiliseconds = 1000;
    let incrementTime = (totalMiliseconds / end);
    
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count}</span>;
};

const Home = ({ journals }: { journals: any[] }) => {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Leaderboard Logic
  const getLeaderboard = () => {
    const classes = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
    const leaderboard = classes.map(cls => {
      const classJournals = journals.filter(j => j.class === cls && j.status === 'Dinilai');
      
      // Aggregate points per student
      const studentPoints: Record<string, number> = {};
      classJournals.forEach(j => {
        studentPoints[j.studentName] = (studentPoints[j.studentName] || 0) + (j.points || 0);
      });

      // Find top student
      let topStudent = null;
      let maxPoints = -1;

      for (const [name, pts] of Object.entries(studentPoints)) {
        if (pts > maxPoints) {
          maxPoints = pts;
          topStudent = { name, points: pts };
        }
      }

      return { class: cls, topStudent };
    }).filter(item => item.topStudent !== null);

    return leaderboard;
  };

  const topStudents = getLeaderboard();
  const overallWinner = topStudents.length > 0 
    ? [...topStudents].sort((a, b) => (b.topStudent?.points || 0) - (a.topStudent?.points || 0))[0]
    : null;

  // Mock data for Ciamis 2026 (Ramadan 1447H)
  // In a real app, we'd fetch this from an API
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        // Using Aladhan API for Ciamis
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Ciamis&country=Indonesia&method=11');
        const data = await response.json();
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
        }
      } catch (error) {
        console.error("Failed to fetch prayer times", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const timer = setInterval(() => {
      const now = new Date();
      const maghribTime = prayerTimes.Maghrib.split(':');
      const target = new Date();
      target.setHours(parseInt(maghribTime[0]), parseInt(maghribTime[1]), 0);

      if (now > target) {
        // If past maghrib, target next day's maghrib (simplified)
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ h, m, s });
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerTimes]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 bg-emerald-900 flex items-center justify-center overflow-hidden rounded-b-3xl shadow-2xl">
        <div className="absolute inset-0">
          <img 
            src="https://storage.jakarta-tourism.go.id/public/articles/e6c92726-bfbe-4661-b6f8-556cc58cb1da.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 to-emerald-900/50"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl sm:text-5xl font-bold text-white mb-2"
          >
            Dirasah Smart School
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-emerald-200 text-lg sm:text-2xl font-serif italic"
          >
            Ramadhan Galuh SDN 1 Ciparigi 1447 H / 2026 M
          </motion.p>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="max-w-4xl mx-auto px-4 -mt-16">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center border border-emerald-100"
        >
          <h2 className="text-emerald-800 font-semibold text-lg mb-4 flex items-center justify-center gap-2">
            <Clock className="text-emerald-600" />
            Menuju Waktu Berbuka Puasa (Maghrib)
          </h2>
          
          {timeLeft ? (
            <div className="flex justify-center gap-4 sm:gap-8">
              {[
                { label: 'Jam', value: timeLeft.h },
                { label: 'Menit', value: timeLeft.m },
                { label: 'Detik', value: timeLeft.s }
              ].map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <div className="bg-emerald-50 w-16 h-16 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center mb-2 shadow-inner">
                    <span className="text-2xl sm:text-4xl font-bold text-emerald-700">
                      {unit.value.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-emerald-600 font-medium uppercase tracking-wider">{unit.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-pulse text-emerald-400">Menghitung waktu...</div>
          )}
          
          <p className="mt-6 text-emerald-600 text-sm italic">
            Lokasi: Kabupaten Ciamis, Jawa Barat
          </p>
        </motion.div>
      </section>

      {/* Imsakiyah Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-50">
          <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Jadwal Imsakiyah Hari Ini</h3>
            <Calendar className="text-emerald-200" />
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
              </div>
            ) : prayerTimes ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { name: 'Imsak', time: prayerTimes.Imsak, color: 'bg-amber-50 text-amber-700' },
                  { name: 'Subuh', time: prayerTimes.Fajr, color: 'bg-blue-50 text-blue-700' },
                  { name: 'Dzuhur', time: prayerTimes.Dhuhr, color: 'bg-emerald-50 text-emerald-700' },
                  { name: 'Ashar', time: prayerTimes.Asr, color: 'bg-orange-50 text-orange-700' },
                  { name: 'Maghrib', time: prayerTimes.Maghrib, color: 'bg-rose-50 text-rose-700' },
                  { name: 'Isya', time: prayerTimes.Isha, color: 'bg-indigo-50 text-indigo-700' },
                ].map((p) => (
                  <div key={p.name} className={cn("p-4 rounded-xl text-center transition-transform hover:scale-105", p.color)}>
                    <div className="text-xs font-bold uppercase mb-1 opacity-70">{p.name}</div>
                    <div className="text-xl font-bold">{p.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-red-500 py-4">Gagal memuat jadwal.</div>
            )}
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      {topStudents.length > 0 && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100 relative">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50"></div>

            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 px-8 py-8 flex items-center justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-white font-bold text-3xl flex items-center gap-3 mb-1">
                  <Trophy className="text-amber-400 drop-shadow-lg" size={32} />
                  Bintang Ramadhan Terpuji
                </h3>
                <p className="text-emerald-100 text-sm opacity-90 font-medium">Penghargaan Siswa Teladan Berdasarkan Capaian Poin</p>
              </div>
              <div className="hidden sm:flex gap-2 relative z-10">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2 + i, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Star className="text-amber-300 fill-amber-300" size={24 - (i * 4)} />
                  </motion.div>
                ))}
              </div>
              
              {/* Decorative Stars in Header */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-white/10"
                    initial={{ x: Math.random() * 1000, y: Math.random() * 100 }}
                    animate={{ 
                      y: [0, -20, 0],
                      opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ 
                      duration: 3 + Math.random() * 5, 
                      repeat: Infinity 
                    }}
                  >
                    <Star size={12 + Math.random() * 20} fill="currentColor" />
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="p-8 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {topStudents.map((item, idx) => {
                  const isOverallWinner = overallWinner?.class === item.class;
                  return (
                    <motion.div 
                      key={item.class}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="relative group"
                    >
                      {/* Glow Effect */}
                      <div className={cn(
                        "absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-500",
                        isOverallWinner ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                      )}></div>
                      
                      <div className="relative bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-5">
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-inner flex-shrink-0",
                          isOverallWinner ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {item.class.split(' ')[1]}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                              isOverallWinner ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-600"
                            )}>
                              {item.class}
                            </span>
                            {isOverallWinner && (
                              <span className="bg-rose-100 text-rose-600 text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Heart size={8} fill="currentColor" /> TERBAIK
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-emerald-950 truncate text-lg group-hover:text-emerald-700 transition-colors">
                            {item.topStudent?.name}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 items-center gap-1.5">
                              <Star size={14} className="fill-amber-400 text-amber-400 animate-spin-slow" />
                              <span className="text-sm font-black text-amber-700">
                                <Counter value={item.topStudent?.points || 0} />
                              </span>
                              <span className="text-[10px] font-bold text-amber-600/70 uppercase">Poin</span>
                            </div>
                          </div>
                        </div>

                        {/* Badge */}
                        <div className={cn(
                          "absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-110",
                          isOverallWinner ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-white rotate-12" : "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white -rotate-12"
                        )}>
                          {isOverallWinner ? <Trophy size={20} /> : <Star size={20} fill="currentColor" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Footer Note */}
            <div className="bg-slate-50 px-8 py-4 border-t border-emerald-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Clock size={14} />
                Pembaruan terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                Terus tingkatkan amalanmu untuk menjadi Bintang Ramadhan!
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Program', icon: Star, color: 'bg-purple-500', link: '/program' },
          { title: 'Jadwal', icon: Calendar, color: 'bg-blue-500', link: '/jadwal' },
          { title: 'Jurnal', icon: BookOpen, color: 'bg-emerald-500', link: '/jurnal-siswa' },
          { title: 'Guru', icon: Settings, color: 'bg-amber-500', link: '/guru' },
        ].map((item) => (
          <Link key={item.title} to={item.link} className="group">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-emerald-50 flex flex-col items-center transition-all group-hover:shadow-lg group-hover:-translate-y-1">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white mb-4", item.color)}>
                <item.icon size={24} />
              </div>
              <span className="font-bold text-emerald-800">{item.title}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

const Program = () => (
  <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
    <div className="text-center">
      <h2 className="text-3xl font-bold text-emerald-900">Program Kegiatan</h2>
      <p className="text-emerald-600">Visi dan Misi Pesantren Ramadhan 1447H</p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-50">
        <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
          <Star className="text-amber-500" />
          Program Unggulan
        </h3>
        <ul className="space-y-4">
          {[
            "Shalat Dhuha",
            "Asmaul Husna",
            "Tadarus Al-Qur’an",
            "Hafalan Doa-doa",
            "Hafalan Surat Pendek",
            "Sikap & Akhlak",
            "Poster & Media Kreatif",
            "Fun Games & Edukasi"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-emerald-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-emerald-900 p-8 rounded-3xl shadow-lg text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <GraduationCap className="text-emerald-400" />
          Tujuan Kegiatan
        </h3>
        <p className="text-emerald-100 leading-relaxed">
          Membentuk karakter siswa yang religius, cerdas, dan berakhlak mulia melalui pembiasaan ibadah dan pembelajaran yang bermakna selama bulan suci Ramadhan.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-emerald-800 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <div className="text-xs uppercase">Partisipasi</div>
          </div>
          <div className="bg-emerald-800 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-emerald-400">30 Hari</div>
            <div className="text-xs uppercase">Pembiasaan</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Jadwal = () => (
  <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
    <div className="text-center">
      <h2 className="text-3xl font-bold text-emerald-900">Jadwal Kegiatan Harian</h2>
      <p className="text-emerald-600">Rangkaian acara harian Pesantren Ramadhan</p>
    </div>
    
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">
      <table className="w-full text-left">
        <thead className="bg-emerald-700 text-white">
          <tr>
            <th className="px-6 py-4 font-bold">Waktu</th>
            <th className="px-6 py-4 font-bold">Kegiatan</th>
            <th className="px-6 py-4 font-bold">Keterangan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-50">
          {[
            { time: '07.30 - 07.45', activity: 'Shalat Dhuha', desc: '-' },
            { time: '07.45 - 08.00', activity: 'Asmaul Husna', desc: '-' },
            { time: '08.00 - 08.15', activity: 'Tadarus Al-Qur’an', desc: '-' },
            { time: '08.15 - 08.30', activity: 'Hafalan Doa-doa', desc: '-' },
            { time: '08.30 - 09.00', activity: 'Hafalan Surat Pendek', desc: '-' },
            { time: '09.00 - 09.30', activity: 'ISTIRAHAT', desc: '-' },
            { time: '09.30 - 11.30', activity: 'Pelajaran Umum', desc: '-' },
            { time: '11.30 - 12.00', activity: 'Poster & Media Kreatif', desc: 'Fun Games & Edukasi' },
            { time: '12.00 - 12.30', activity: 'Sholat Dzuhur Berjamaah', desc: '-' },
          ].map((row, i) => (
            <tr key={i} className="hover:bg-emerald-50 transition-colors">
              <td className="px-6 py-4 font-mono text-emerald-700">{row.time}</td>
              <td className="px-6 py-4 font-semibold text-emerald-900">{row.activity}</td>
              <td className="px-6 py-4 text-emerald-600">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Materi = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [surahList, setSurahList] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [asmaulHusna, setAsmaulHusna] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected === 'Al Quran' && surahList.length === 0) {
      setLoading(true);
      fetch('https://api.alquran.cloud/v1/surah')
        .then(res => res.json())
        .then(data => {
          setSurahList(data.data);
          setLoading(false);
        });
    }
    if (selected === 'Asmaul Husna' && asmaulHusna.length === 0) {
      setLoading(true);
      fetch('https://api.aladhan.com/v1/asmaAlHusna')
        .then(res => res.json())
        .then(data => {
          setAsmaulHusna(data.data);
          setLoading(false);
        });
    }
  }, [selected]);

  const fetchSurahDetail = (number: number) => {
    setLoading(true);
    fetch(`https://api.alquran.cloud/v1/surah/${number}`)
      .then(res => res.json())
      .then(data => {
        setSelectedSurah(data.data);
        setLoading(false);
      });
  };

  const materials = [
    { title: 'Al Quran', icon: BookOpen, color: 'bg-emerald-500', desc: '114 Surah Al-Quran Lengkap', type: 'internal' },
    { title: 'Panduan Puasa', icon: Star, color: 'bg-amber-500', desc: 'Fiqih dan Adab Berpuasa', type: 'internal' },
    { title: 'Asmaul Husna', icon: Heart, color: 'bg-rose-500', desc: '99 Nama Allah yang Indah', type: 'internal' },
    { title: 'Doa Harian', icon: FileText, color: 'bg-blue-500', desc: 'Kumpulan Doa Sehari-hari', type: 'internal' },
    { title: 'Bacaan Shalat', icon: Heart, color: 'bg-emerald-600', desc: 'Panduan Lengkap Bacaan Shalat', type: 'internal' },
    { title: 'Video Ramadhan', icon: Video, color: 'bg-purple-500', desc: 'Kajian dan Kisah Inspiratif', type: 'external', url: 'https://www.youtube.com/@MediaEdukaBersama/videos' },
    { title: 'Game Edukatif', icon: Gamepad2, color: 'bg-indigo-500', desc: 'Belajar Sambil Bermain', type: 'external', url: 'https://sites.google.com/view/mediaedukabersama/game-edukasi?authuser=0' },
  ];

  const staticContent: Record<string, any> = {
    'Panduan Puasa': [
      { title: 'Niat Puasa', content: 'نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى', sub: 'Nawaitu shauma ghadin \'an ada\'i fardhi syahri ramadhana hadzihis sanati lillahi ta\'ala' },
      { title: 'Doa Buka Puasa', content: 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ', sub: 'Allahumma laka shumtu wa bika amantu wa \'ala rizqika afthartu birahmatika ya arhamar rahimin' },
      { title: 'Syarat Sah Puasa', content: '1. Islam, 2. Baligh, 3. Berakal, 4. Suci dari Haid & Nifas, 5. Mengetahui waktu puasa.' },
      { title: 'Rukun Puasa', content: '1. Niat di malam hari, 2. Menahan diri dari hal-hal yang membatalkan puasa dari terbit fajar hingga terbenam matahari.' },
    ],
    'Doa Harian': [
      { title: 'Doa Sebelum Makan', content: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ', sub: 'Allahumma barik lana fima razaqtana wa qina \'adzaban nar' },
      { title: 'Doa Sesudah Makan', content: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ', sub: 'Alhamdulillahilladzi ath\'amana wa saqana wa ja\'alana muslimin' },
      { title: 'Doa Untuk Orang Tua', content: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', sub: 'Rabbighfirli waliwalidayya warhamhuma kama rabbayani shaghira' },
      { title: 'Doa Sebelum Tidur', content: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ', sub: 'Bismika Allahumma ahya wa amut' },
    ],
    'Bacaan Shalat': [
      { title: 'Niat Shalat Subuh', content: 'أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى', sub: 'Ushalli fardhash shubhi rak\'ataini mustaqbilal qiblati ada\'an lillahi ta\'ala' },
      { title: 'Niat Shalat Dzuhur', content: 'أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى', sub: 'Ushalli fardhazh zhuhri arba\'a raka\'atin mustaqbilal qiblati ada\'an lillahi ta\'ala' },
      { title: 'Niat Shalat Ashar', content: 'أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى', sub: 'Ushalli fardhal \'ashri arba\'a raka\'atin mustaqbilal qiblati ada\'an lillahi ta\'ala' },
      { title: 'Niat Shalat Maghrib', content: 'أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى', sub: 'Ushalli fardhal maghribi tsalatsa raka\'atin mustaqbilal qiblati ada\'an lillahi ta\'ala' },
      { title: 'Niat Shalat Isya', content: 'أُصَلِّي fَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى', sub: 'Ushalli fardhal \'isya\'i arba\'a raka\'atin mustaqbilal qiblati ada\'an lillahi ta\'ala' },
      { title: 'Takbiratul Ihram', content: 'اللهُ أَكْبَرُ', sub: 'Allahu Akbar' },
      { title: 'Doa Iftitah', content: 'اللهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا وَسُبْحَانَ اللهِ بُكْرَةً وَأَصِيلاً...', sub: 'Allahu akbar kabira walhamdu lillahi katsira wa subhanallahi bukrataw wa ashila...' },
      { title: 'Ruku\'', content: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ', sub: 'Subhana rabbiyal \'adhimi wa bihamdihi (3x)' },
      { title: 'I\'tidal', content: 'سَمِعَ اللهُ لِمَنْ حَمِدَهُ. رَبَّنَا لَكَ الْحَمْدُ', sub: 'Sami\'allahu liman hamidah. Rabbana lakal hamdu' },
      { title: 'Sujud', content: 'سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ', sub: 'Subhana rabbiyal a\'la wa bihamdihi (3x)' },
      { title: 'Duduk di Antara Dua Sujud', content: 'رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَارْفَعْنِي وَارْزُقْنِي وَاهْدِنِي وَعَافِنِي وَاعْفُ عَنِّي', sub: 'Rabbighfirli warhamni wajburni warfa\'ni warzuqni wahdini wa \'afini wa\'fu \'anni' },
      { title: 'Tahiyat Akhir', content: 'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ...', sub: 'At-tahiyyatul mubarakatush shalawatuth thayyibatu lillah...' },
      { title: 'Salam', content: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ', sub: 'Assalamu\'alaikum warahmatullah' },
    ]
  };

  if (selected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <button 
          onClick={() => {
            if (selectedSurah) setSelectedSurah(null);
            else setSelected(null);
          }}
          className="flex items-center gap-2 text-emerald-700 font-bold hover:underline mb-4"
        >
          <X size={20} /> {selectedSurah ? 'Kembali ke Daftar Surah' : 'Kembali ke Menu Materi'}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100"
        >
          <h2 className="text-3xl font-bold text-emerald-900 mb-8 border-b border-emerald-50 pb-4">
            {selectedSurah ? selectedSurah.name : selected}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {selected === 'Al Quran' && !selectedSurah && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {surahList.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => fetchSurahDetail(surah.number)}
                      className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-left hover:bg-emerald-100 transition-colors flex justify-between items-center"
                    >
                      <div>
                        <span className="text-xs font-bold text-emerald-400 mr-2">{surah.number}</span>
                        <span className="font-bold text-emerald-900">{surah.englishName}</span>
                      </div>
                      <span className="text-xl font-serif text-emerald-700">{surah.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedSurah && (
                <div className="space-y-8">
                  {selectedSurah.ayahs.map((ayah: any) => (
                    <div key={ayah.number} className="p-6 border-b border-emerald-50 last:border-0">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {ayah.numberInSurah}
                        </span>
                        <p className="text-3xl text-right font-serif leading-loose flex-grow">{ayah.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selected === 'Asmaul Husna' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {asmaulHusna.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                      <div className="text-2xl font-serif text-emerald-700 mb-2">{item.name}</div>
                      <div className="text-sm font-bold text-emerald-900 mb-1">{item.transliteration}</div>
                      <div className="text-xs text-emerald-600 italic">{item.en.meaning}</div>
                    </div>
                  ))}
                </div>
              )}

              {staticContent[selected]?.map((item: any, i: number) => (
                <div key={i} className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h3 className="font-bold text-emerald-800 mb-3 text-lg">{item.title}</h3>
                  {item.arabic && <p className="text-3xl text-right font-serif mb-4 leading-loose">{item.arabic}</p>}
                  {item.content && <p className="text-xl font-serif mb-2 leading-relaxed">{item.content}</p>}
                  {item.sub && <p className="text-sm text-emerald-600 italic mb-2">{item.sub}</p>}
                  {item.meaning && <p className="text-sm text-emerald-700 font-medium">Artinya: {item.meaning}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-emerald-900">Materi Pembelajaran</h2>
        <p className="text-emerald-600">Perdalam ilmu agama di bulan suci Ramadhan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => {
              if (item.type === 'external') {
                window.open(item.url, '_blank');
              } else {
                setSelected(item.title);
              }
            }}
            className="bg-white p-6 rounded-3xl shadow-lg border border-emerald-50 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform", item.color)}>
              <item.icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">{item.title}</h3>
            <p className="text-emerald-600 text-sm">{item.desc}</p>
            <div className="mt-6 flex items-center text-emerald-700 font-bold text-sm group-hover:translate-x-2 transition-transform">
              {item.type === 'external' ? 'Buka Link' : 'Lihat Materi'} <ChevronRight size={16} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Login = ({ type, onLogin, students }: { type: 'siswa' | 'guru', onLogin: (user: string) => void, students?: any[] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'siswa') {
      const student = students?.find(s => s.username.toLowerCase() === username.toLowerCase());
      if (student) {
        onLogin(student.name);
      } else {
        setError('Username tidak ditemukan. Silahkan hubungi guru.');
      }
    } else {
      // Guru login - simple demo check
      if (username.toLowerCase() === 'guru' && password === 'admin123') {
        onLogin('Bapak/Ibu Guru');
      } else {
        setError('Username atau password guru salah.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-2xl border border-emerald-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-700 mb-4">
            {type === 'guru' ? <Lock size={32} /> : <User size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-emerald-900">Login {type === 'guru' ? 'Guru' : 'Siswa'}</h2>
          <p className="text-emerald-600 text-sm">Silahkan masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                placeholder={type === 'guru' ? 'Username Guru' : 'Username Siswa...'} 
                required 
              />
            </div>
          </div>

          {type === 'guru' && (
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  placeholder="Password Guru..." 
                  required 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-800 transition-all active:scale-95"
          >
            Masuk
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const JurnalSiswa = ({ user, onLogout, journals, setJournals }: { 
  user: string | null, 
  onLogout: () => void,
  journals: any[],
  setJournals: (j: any[]) => void
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [selectedClass, setSelectedClass] = useState('Kelas 1');

  const myJournals = journals.filter(j => j.studentName === user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJournal = {
      id: Date.now(),
      studentName: user,
      class: selectedClass,
      date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      checklist,
      note,
      points: 0,
      teacherNote: '',
      status: 'Pending'
    };
    setJournals([newJournal, ...journals]);
    setSubmitted(true);
    setNote('');
    setChecklist([]);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const toggleCheck = (item: string) => {
    if (checklist.includes(item)) {
      setChecklist(checklist.filter(i => i !== item));
    } else {
      setChecklist([...checklist, item]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-emerald-800">
          <User size={20} />
          <span className="font-bold">Halo, {user}</span>
        </div>
        <button onClick={onLogout} className="text-sm text-rose-600 font-bold hover:underline">Keluar</button>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-emerald-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <BookOpen className="text-emerald-700" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-900">Jurnal Harian Siswa</h2>
            <p className="text-emerald-600">Catat amalan harianmu di sini</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">Nama Lengkap</label>
              <input type="text" value={user || ''} className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-slate-50 text-slate-500 cursor-not-allowed" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">Kelas</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              >
                {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2">Checklist Ibadah</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {['Shalat 5 Waktu', 'Puasa', 'Tadarus', 'Shalat Tarawih', 'Shalat Dhuha', 'Sedekah'].map((item) => (
                <label key={item} className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                  checklist.includes(item) ? "bg-emerald-700 border-emerald-700 text-white shadow-md" : "border-emerald-50 hover:bg-emerald-50 text-emerald-700"
                )}>
                  <input 
                    type="checkbox" 
                    checked={checklist.includes(item)}
                    onChange={() => toggleCheck(item)}
                    className="hidden" 
                  />
                  <span className="text-sm font-medium">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-2">Catatan Kebaikan Hari Ini</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-32" 
              placeholder="Tuliskan hal baik yang kamu lakukan hari ini..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-800 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {submitted ? 'Berhasil Terkirim!' : 'Simpan Jurnal'}
            {!submitted && <ChevronRight size={20} />}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-emerald-900">Riwayat Jurnal & Penilaian</h3>
        {myJournals.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-emerald-50 text-center text-slate-400 italic">
            Belum ada riwayat jurnal.
          </div>
        ) : (
          <div className="grid gap-6">
            {myJournals.map((j) => (
              <motion.div 
                key={j.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl shadow-md border border-emerald-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-500 uppercase">{j.date}</span>
                    <h4 className="font-bold text-emerald-900">{j.class}</h4>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    j.status === 'Dinilai' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {j.status}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {j.checklist.map((item: string) => (
                    <span key={item} className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100">
                      {item}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-slate-600 mb-4 italic">"{j.note}"</p>

                {j.status === 'Dinilai' && (
                  <div className="mt-4 pt-4 border-t border-emerald-50 bg-emerald-50/30 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700">Penilaian Guru</span>
                      <div className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Star size={14} className="fill-emerald-500 text-emerald-500" />
                        {j.points} Poin
                      </div>
                    </div>
                    <p className="text-sm text-emerald-800 font-medium">Catatan: {j.teacherNote}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TeacherMenu = ({ user, onLogout, students, setStudents, grades, setGrades, journals, setJournals, teacherJournals, setTeacherJournals }: { 
  user: string | null, 
  onLogout: () => void,
  students: any[],
  setStudents: (s: any[]) => void,
  grades: any[],
  setGrades: (g: any[]) => void,
  journals: any[],
  setJournals: (j: any[]) => void,
  teacherJournals: any[],
  setTeacherJournals: (tj: any[]) => void
}) => {
  const [activeTab, setActiveTab] = useState('tema');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [selectedClass, setSelectedClass] = useState('Kelas 1');
  const [gradingJournal, setGradingJournal] = useState<any | null>(null);
  const [points, setPoints] = useState(0);
  const [teacherNote, setTeacherNote] = useState('');

  // Teacher Journal Form State
  const [tjForm, setTjForm] = useState({
    date: new Date().toISOString().split('T')[0],
    tema: '',
    tujuan: '',
    aktivitas: '',
    metode: '',
    hasil: '',
    refleksi: ''
  });

  if (!user) return null;

  const tabs = [
    { id: 'tema', name: 'Tema Projek', icon: Star },
    { id: 'rencana', name: 'Perencanaan', icon: ClipboardList },
    { id: 'siswa', name: 'Data Siswa', icon: User },
    { id: 'jurnal-siswa', name: 'Jurnal Siswa', icon: BookOpen },
    { id: 'jurnal', name: 'Jurnal Guru', icon: FileText },
    { id: 'nilai', name: 'Daftar Nilai', icon: UserCheck },
  ];

  const classes = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

  const filteredStudents = students.filter(s => s.class === selectedClass);
  const filteredJournals = journals.filter(j => j.class === selectedClass);
  const filteredTeacherJournals = teacherJournals.filter(tj => tj.class === selectedClass);

  const handleAddTeacherJournal = (e: React.FormEvent) => {
    e.preventDefault();
    const newTj = {
      ...tjForm,
      id: Date.now(),
      class: selectedClass,
      teacherName: user
    };
    setTeacherJournals([newTj, ...teacherJournals]);
    setTjForm({
      date: new Date().toISOString().split('T')[0],
      tema: '',
      tujuan: '',
      aktivitas: '',
      metode: '',
      hasil: '',
      refleksi: ''
    });
  };

  const handleGradeJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (gradingJournal) {
      const updatedJournals = journals.map(j => 
        j.id === gradingJournal.id 
          ? { ...j, points, teacherNote, status: 'Dinilai' } 
          : j
      );
      setJournals(updatedJournals);
      setGradingJournal(null);
      setPoints(0);
      setTeacherNote('');
    }
  };

  const updateGrade = (studentId: number, field: string, value: any) => {
    const existingGrade = grades.find(g => g.studentId === studentId);
    if (existingGrade) {
      setGrades(grades.map(g => g.studentId === studentId ? { ...g, [field]: value } : g));
    } else {
      setGrades([...grades, { studentId, [field]: value }]);
    }
  };

  const getGradeValue = (studentId: number, field: string) => {
    const grade = grades.find(g => g.studentId === studentId);
    return grade ? grade[field] : '';
  };

  const calculateFinal = (studentId: number) => {
    const g = grades.find(g => g.studentId === studentId);
    if (!g) return 0;
    const fields = ['sholat', 'tadarus', 'doa', 'asmaul', 'btq', 'akhlak', 'peduli'];
    const total = fields.reduce((acc, f) => acc + (Number(g[f]) || 0), 0);
    return (total / fields.length).toFixed(1);
  };

  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const downloadRekapSiswa = () => {
    const data = filteredJournals.map((j, i) => ({
      'No': i + 1,
      'Nama Siswa': j.studentName,
      'Tanggal': j.date,
      'Amalan': j.checklist.join(', '),
      'Catatan Siswa': j.note,
      'Poin': j.points,
      'Catatan Guru': j.teacherNote,
      'Status': j.status
    }));
    exportToExcel(data, `Rekap_Jurnal_Siswa_${selectedClass}`);
  };

  const downloadRekapGuru = () => {
    const data = filteredTeacherJournals.map((tj, i) => ({
      'No': i + 1,
      'Tanggal': tj.date,
      'Tema': tj.tema,
      'Tujuan': tj.tujuan,
      'Aktivitas': tj.aktivitas,
      'Metode': tj.metode,
      'Hasil': tj.hasil,
      'Refleksi': tj.refleksi
    }));
    exportToExcel(data, `Rekap_Jurnal_Guru_${selectedClass}`);
  };

  const downloadRekapNilai = () => {
    const data = filteredStudents.map((s, i) => ({
      'No': i + 1,
      'Nama Murid': s.name,
      'Sholat Dhuha': getGradeValue(s.id, 'sholat'),
      'Tadarus': getGradeValue(s.id, 'tadarus'),
      'Hafalan Doa': getGradeValue(s.id, 'doa'),
      'Asmaul Husna': getGradeValue(s.id, 'asmaul'),
      'BTQ': getGradeValue(s.id, 'btq'),
      'Akhlak': getGradeValue(s.id, 'akhlak'),
      'Kepedulian': getGradeValue(s.id, 'peduli'),
      'Nilai Akhir': calculateFinal(s.id),
      'Catatan Guru': getGradeValue(s.id, 'note')
    }));
    exportToExcel(data, `Rekap_Daftar_Nilai_${selectedClass}`);
  };

  const themes = [
    {
      id: "I",
      title: "Ramadhan Membentuk Iman, Ilmu, dan Akhlak Mulia",
      tujuan: "Membiasakan peserta didik menjalankan ibadah Ramadhan secara sadar, tertib, dan berkesinambungan melalui kegiatan shalat dhuha, pembacaan Asmaul Husna, tadarus Al-Qur’an, hafalan doa-doa harian, dan dzikir. Meningkatkan keimanan, memperluas pemahaman keagamaan, serta menumbuhkan akhlak mulia (disiplin, santun, tanggung jawab).",
      alur: [
        "Pengenalan tema dan tujuan projek Ramadhan",
        "Pembiasaan shalat dhuha berjamaah",
        "Pembacaan Asmaul Husna dan dzikir harian",
        "Kegiatan tadarus Al-Qur’an rutin",
        "Hafalan doa-doa harian dan penguatan adab",
        "Refleksi sederhana pelaksanaan ibadah",
        "Dokumentasi kegiatan dan hasil pembiasaan"
      ],
      target: [
        "Terbiasa shalat dhuha dan dzikir tertib",
        "Mampu membaca/menghafal Asmaul Husna & doa harian",
        "Peningkatan kemampuan tadarus Al-Qur’an",
        "Terbentuk sikap disiplin, santun, dan tanggung jawab",
        "Mampu merefleksikan makna ibadah dalam perilaku"
      ]
    },
    {
      id: "II",
      title: "Kisah Teladan Nabi, Inspirasi Akhlak Mulia di Bulan Ramadhan",
      tujuan: "Menumbuhkan akhlak mulia melalui keteladanan kisah Nabi dan sahabat, cerita inspiratif Ramadhan, serta pembiasaan sikap saling menghargai. Meneladani nilai kejujuran, kesabaran, empati, dan tanggung jawab.",
      alur: [
        "Pengenalan tema Kisah Teladan Nabi",
        "Menyimak kisah Nabi dan sahabat (lisan/buku/video)",
        "Menonton video inspiratif sikap saling menghargai",
        "Ceramah singkat penguatan nilai akhlak",
        "Diskusi nilai teladan di sekolah dan rumah",
        "Refleksi penerapan akhlak mulia",
        "Dokumentasi kegiatan dan hasil refleksi"
      ],
      target: [
        "Memahami nilai akhlak mulia kisah Nabi",
        "Meneladani sikap jujur, sabar, disiplin, peduli",
        "Mampu menceritakan kembali kisah Islami",
        "Pengembangan komunikasi dan penalaran kritis",
        "Menunjukkan perilaku akhlak mulia di lingkungan"
      ]
    },
    {
      id: "III",
      title: "Tubuh Sehat, Puasa Kuat, Ibadah Semangat",
      tujuan: "Menumbuhkan kesadaran pentingnya menjaga kesehatan tubuh melalui pola makan bergizi dan perilaku hidup sehat. Mengaitkan kesehatan tubuh dengan kekuatan berpuasa serta peningkatan kualitas ibadah.",
      alur: [
        "Pengenalan tema Tubuh Sehat, Puasa Kuat",
        "Diskusi pengalaman sahur dan berbuka",
        "Konsep makanan sehat (karbo, protein, sayur, buah)",
        "Literasi hidup sehat saat Ramadhan",
        "Diskusi kelompok kebiasaan makan sehat",
        "Aksi perencanaan menu sahur/berbuka sehat",
        "Dokumentasi dan pelaporan hasil kegiatan"
      ],
      target: [
        "Memahami manfaat makanan bergizi saat puasa",
        "Mampu memilih makanan sehat sahur/berbuka",
        "Menunjukkan kebiasaan hidup bersih dan sehat",
        "Mengaitkan tubuh sehat dengan semangat ibadah",
        "Mengkomunikasikan pemahaman hidup sehat"
      ]
    },
    {
      id: "IV",
      title: "Cinta Al-Qur’an sebagai Pedoman Hidup",
      tujuan: "Menumbuhkan kecintaan terhadap Al-Qur’an melalui pembiasaan membaca, menghafal, menulis, dan mengamalkan nilai-nilainya. Meningkatkan literasi Al-Qur’an dan kedisiplinan ibadah.",
      alur: [
        "Pengenalan tema Cinta Al-Qur’an",
        "Kegiatan BTQ sesuai tingkat kemampuan",
        "Hafalan surat pendek bertahap",
        "Pembiasaan ODOA (One Day One Ayat)",
        "Kegiatan kaligrafi sederhana",
        "Refleksi makna ayat/surat dalam kehidupan",
        "Dokumentasi hasil kegiatan dan pelaporan"
      ],
      target: [
        "Kecintaan terhadap Al-Qur’an sebagai pedoman",
        "Terbiasa membaca & mempelajari Al-Qur’an rutin",
        "Peningkatan kemampuan BTQ",
        "Hafalan surat pendek dan ayat pilihan",
        "Karakter religius, disiplin, dan berakhlak mulia"
      ]
    },
    {
      id: "V",
      title: "Ramadhan Digital: Belajar, Beribadah, dan Berbagi",
      tujuan: "Menumbuhkan kecakapan digital sekaligus menanamkan nilai ibadah dan berbagi. Meningkatkan literasi digital, kreativitas, dan kedisiplinan melalui teknologi.",
      alur: [
        "Pengenalan tema Ramadhan Digital",
        "Edukasi penggunaan teknologi positif",
        "Pembuatan poster/konten digital Ramadhan",
        "Dokumentasi aksi berbagi melalui foto/video",
        "Bermain fun games edukatif islami",
        "Refleksi pengalaman belajar digital",
        "Publikasi hasil kegiatan di media sekolah"
      ],
      target: [
        "Cakap menggunakan teknologi untuk hal kreatif",
        "Mampu membuat karya digital bertema Ramadhan",
        "Dokumentasi digital aksi kebaikan",
        "Partisipasi aktif dalam game edukatif",
        "Memahami teknologi sebagai sarana ibadah"
      ]
    }
  ];

  const [newStudent, setNewStudent] = useState({ name: '', username: '', class: 'Kelas 1' });

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.name && newStudent.username) {
      setStudents([...students, { ...newStudent, id: Date.now() }]);
      setNewStudent({ name: '', username: '', class: 'Kelas 1' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-3xl font-bold text-emerald-900">Menu Guru</h2>
            <button onClick={onLogout} className="text-xs text-rose-600 font-bold hover:underline">Keluar</button>
          </div>
          <p className="text-emerald-600">Manajemen Pembelajaran Pesantren Ramadhan</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-md border border-emerald-50 overflow-x-auto max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-emerald-700 text-white shadow-md" 
                  : "text-emerald-600 hover:bg-emerald-50"
              )}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100 min-h-[400px]">
        {activeTab === 'tema' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {themes.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(idx)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all",
                    selectedTheme === idx 
                      ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300" 
                      : "bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100"
                  )}
                >
                  Projek {t.id}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              <div className="border-l-4 border-emerald-500 pl-6">
                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-1">Tema Projek Kokurikuler {themes[selectedTheme].id}</h3>
                <h4 className="text-2xl font-bold text-emerald-900 leading-tight">"{themes[selectedTheme].title}"</h4>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h5 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                      <Star size={18} className="text-amber-500" />
                      Tujuan Projek
                    </h5>
                    <p className="text-emerald-700 leading-relaxed bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50">
                      {themes[selectedTheme].tujuan}
                    </p>
                  </section>

                  <section>
                    <h5 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                      <Clock size={18} className="text-blue-500" />
                      Alur Kegiatan
                    </h5>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {themes[selectedTheme].alur.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white border border-emerald-50 rounded-xl">
                          <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-sm text-emerald-800">{step}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-xl">
                  <h5 className="font-bold mb-6 flex items-center gap-2 text-emerald-300">
                    <UserCheck size={18} />
                    Target Capaian
                  </h5>
                  <ul className="space-y-4">
                    {themes[selectedTheme].target.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        <span className="text-sm text-emerald-50 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rencana' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="text-center border-b border-emerald-50 pb-6">
              <h3 className="text-2xl font-bold text-emerald-900 uppercase">Perencanaan Kegiatan Kokurikuler</h3>
              <p className="text-emerald-600 font-bold">DIRASAH SMART SCHOOL’S RAMADHAN GALUH</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-emerald-50/50 p-6 rounded-3xl border border-emerald-50">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-emerald-100 pb-1">
                  <span className="text-emerald-600 text-sm">Satuan Pendidikan</span>
                  <span className="font-bold text-emerald-900 text-sm">SDN Ramadhan Galuh</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1">
                  <span className="text-emerald-600 text-sm">Kelas</span>
                  <span className="font-bold text-emerald-900 text-sm">V (Lima)</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1">
                  <span className="text-emerald-600 text-sm">Alokasi Waktu</span>
                  <span className="font-bold text-emerald-900 text-sm">2 x 30 Menit</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-emerald-100 pb-1">
                  <span className="text-emerald-600 text-sm">Tema</span>
                  <span className="font-bold text-emerald-900 text-sm text-right ml-4">Tubuh Sehat, Puasa Kuat, Ibadah Semangat</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1">
                  <span className="text-emerald-600 text-sm">Lokasi</span>
                  <span className="font-bold text-emerald-900 text-sm">Lingkungan SDN Ramadhan Galuh</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <section>
                  <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">A</div>
                    Dimensi Profil Lulusan
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Penalaran Kritis', 'Kreativitas', 'Komunikasi'].map(d => (
                      <span key={d} className="px-4 py-2 bg-white border border-emerald-100 rounded-xl text-sm font-bold text-emerald-700 shadow-sm">{d}</span>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">B</div>
                    Tujuan Pembelajaran
                  </h4>
                  <ul className="space-y-3">
                    {[
                      "Memahami keterkaitan antara menjaga kesehatan tubuh, menjalankan puasa dengan benar, dan meningkatkan kualitas ibadah.",
                      "Menumbuhkan kesadaran hidup sehat, disiplin diri, serta semangat beribadah sebagai bagian dari pembentukan karakter beriman, mandiri, dan bertanggung jawab."
                    ].map((t, i) => (
                      <li key={i} className="flex gap-3 text-sm text-emerald-700 leading-relaxed">
                        <ChevronRight size={16} className="mt-1 flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">D</div>
                    Lingkungan Belajar
                  </h4>
                  <p className="text-sm text-emerald-700 leading-relaxed bg-slate-50 p-4 rounded-2xl italic">
                    "Memberi kesempatan kepada murid untuk menganalisis kondisi lingkungan terkait pola makan sehat selama Ramadhan secara kolaboratif dan melakukan aksi nyata sebagai solusi."
                  </p>
                </section>
              </div>

              <div className="space-y-8">
                <section>
                  <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">G</div>
                    Rangkaian Kegiatan
                  </h4>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      "Peserta didik hadir dan mengikuti pembiasaan pagi (tertib & religius).",
                      "Pelaksanaan shalat dhuha berjamaah sesuai jadwal.",
                      "Dzikir dan pembacaan Asmaul Husna bersama-sama.",
                      "Guru menyampaikan tujuan kegiatan & kaitan makanan sehat dengan ibadah.",
                      "Apersepsi tanya jawab tentang menu sahur dan berbuka siswa.",
                      "Diskusi pengertian makanan sehat & bergizi saat berpuasa.",
                      "Pengenalan contoh makanan sehat (karbo, protein, sayur, buah).",
                      "Hafalan doa sebelum/sesudah makan & adab makan Islam.",
                      "Aktivitas pengelompokan menu sahur/berbuka sehat (diskusi kelompok).",
                      "Refleksi dampak makanan sehat terhadap kekuatan puasa.",
                      "Kegiatan kreatif: pembuatan poster/jurnal 'Menu Sehat'.",
                      "Penguatan pesan hidup sehat & tidak berlebihan saat berbuka.",
                      "Doa penutup & komitmen bersama menjaga kesehatan."
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-white border border-emerald-50 rounded-xl hover:shadow-sm transition-shadow">
                        <span className="text-xs font-bold text-emerald-400 mt-0.5">{i+1}.</span>
                        <span className="text-xs text-emerald-800 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <section className="pt-8 border-t border-emerald-50">
              <h4 className="font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">H</div>
                Sistem Asesmen
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-emerald-900 rounded-3xl text-white">
                  <h5 className="font-bold mb-3 text-emerald-300">Formatif</h5>
                  <p className="text-sm opacity-80 mb-4">Teknik observasi dengan instrumen catatan anekdotal.</p>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <div className="bg-emerald-800 p-2 rounded-lg text-center">Penalaran Kritis</div>
                    <div className="bg-emerald-800 p-2 rounded-lg text-center">Kreativitas</div>
                    <div className="bg-emerald-800 p-2 rounded-lg text-center">Komunikasi</div>
                  </div>
                </div>
                <div className="p-5 bg-amber-600 rounded-3xl text-white">
                  <h5 className="font-bold mb-3 text-amber-100">Sumatif</h5>
                  <p className="text-sm opacity-80 mb-4">Penilaian kinerja dengan instrumen rubrik (SB, B, C, K).</p>
                  <div className="flex gap-2">
                    {['Sangat Baik', 'Baik', 'Cukup', 'Kurang'].map(s => (
                      <span key={s} className="text-[10px] bg-amber-700 px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'siswa' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="text-xl font-bold text-emerald-800 mb-4">Tambah Data Siswa Baru</h3>
              <form onSubmit={addStudent} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  placeholder="Nama Lengkap" 
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="px-4 py-2 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Username Login" 
                  value={newStudent.username}
                  onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                  className="px-4 py-2 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <div className="flex gap-2">
                  <select 
                    value={newStudent.class}
                    onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                    className="flex-grow px-4 py-2 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button type="submit" className="bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-800 transition-all">
                    Tambah
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-emerald-800">Daftar Akun Siswa</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="px-4 py-3 text-emerald-700 font-bold">Nama</th>
                      <th className="px-4 py-3 text-emerald-700 font-bold">Username</th>
                      <th className="px-4 py-3 text-emerald-700 font-bold">Kelas</th>
                      <th className="px-4 py-3 text-emerald-700 font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-emerald-50/50">
                        <td className="px-4 py-3 font-medium text-emerald-900">{s.name}</td>
                        <td className="px-4 py-3 font-mono text-sm text-emerald-600">{s.username}</td>
                        <td className="px-4 py-3 text-emerald-600">{s.class}</td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => setStudents(students.filter(item => item.id !== s.id))}
                            className="text-rose-600 hover:text-rose-800 text-sm font-bold"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'jurnal-siswa' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-emerald-800">Koreksi Jurnal Siswa</h3>
                <button 
                  onClick={downloadRekapSiswa}
                  className="bg-white text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <Download size={16} /> Rekap Excel
                </button>
              </div>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 rounded-xl border border-emerald-200 bg-white font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {gradingJournal && (
              <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-emerald-100"
                >
                  <h4 className="text-xl font-bold text-emerald-900 mb-6">Beri Nilai Jurnal: {gradingJournal.studentName}</h4>
                  <form onSubmit={handleGradeJournal} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-emerald-700 mb-2">Poin (0-100)</label>
                      <input 
                        type="number" 
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-emerald-700 mb-2">Catatan Guru</label>
                      <textarea 
                        value={teacherNote}
                        onChange={(e) => setTeacherNote(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                        placeholder="Tuliskan masukan untuk siswa..."
                        required
                      ></textarea>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setGradingJournal(null)}
                        className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-800 shadow-lg transition-all"
                      >
                        Simpan Nilai
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            <div className="grid gap-6">
              {filteredJournals.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  Belum ada jurnal masuk untuk kelas ini.
                </div>
              ) : (
                filteredJournals.map((j) => (
                  <div key={j.id} className="bg-white p-6 rounded-3xl shadow-md border border-emerald-50 flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-emerald-900">{j.studentName}</h4>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">{j.date}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {j.checklist.map((item: string) => (
                          <span key={item} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                            {item}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 italic">"{j.note}"</p>
                      {j.status === 'Dinilai' && (
                        <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-1">
                            <Star size={12} className="fill-emerald-500 text-emerald-500" />
                            {j.points} Poin
                          </div>
                          <p className="text-xs text-emerald-800">Catatan: {j.teacherNote}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      <button 
                        onClick={() => {
                          setGradingJournal(j);
                          setPoints(j.points || 0);
                          setTeacherNote(j.teacherNote || '');
                        }}
                        className={cn(
                          "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                          j.status === 'Dinilai' 
                            ? "border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50" 
                            : "bg-emerald-700 text-white shadow-md hover:bg-emerald-800"
                        )}
                      >
                        {j.status === 'Dinilai' ? 'Ubah Nilai' : 'Beri Nilai'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'jurnal' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-emerald-800">Jurnal Harian Guru</h3>
                <button 
                  onClick={downloadRekapGuru}
                  className="bg-white text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <Download size={16} /> Rekap Excel
                </button>
              </div>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 rounded-xl border border-emerald-200 bg-white font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
              <h4 className="font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <FileText size={20} className="text-emerald-600" />
                Input Jurnal Baru ({selectedClass})
              </h4>
              <form onSubmit={handleAddTeacherJournal} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">Hari / Tanggal</label>
                    <input 
                      type="date" 
                      value={tjForm.date}
                      onChange={(e) => setTjForm({...tjForm, date: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">Tema Kegiatan</label>
                    <input 
                      type="text" 
                      value={tjForm.tema}
                      onChange={(e) => setTjForm({...tjForm, tema: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Contoh: Pembiasaan Adab Makan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">Tujuan Kegiatan</label>
                    <textarea 
                      value={tjForm.tujuan}
                      onChange={(e) => setTjForm({...tjForm, tujuan: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                      placeholder="Tujuan yang ingin dicapai..."
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">Metode / Model</label>
                    <input 
                      type="text" 
                      value={tjForm.metode}
                      onChange={(e) => setTjForm({...tjForm, metode: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Contoh: Demonstrasi & Praktik Langsung"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">Aktivitas Murid</label>
                    <textarea 
                      value={tjForm.aktivitas}
                      onChange={(e) => setTjForm({...tjForm, aktivitas: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                      placeholder="Apa yang dilakukan murid selama kegiatan..."
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">Hasil / Respon Siswa</label>
                    <textarea 
                      value={tjForm.hasil}
                      onChange={(e) => setTjForm({...tjForm, hasil: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                      placeholder="Bagaimana respon dan hasil belajar siswa..."
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">Refleksi Guru</label>
                    <textarea 
                      value={tjForm.refleksi}
                      onChange={(e) => setTjForm({...tjForm, refleksi: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                      placeholder="Catatan reflektif untuk perbaikan ke depan..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="bg-emerald-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-800 transition-all flex items-center gap-2">
                    Simpan Jurnal Guru <ChevronRight size={20} />
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-bold text-emerald-900">Riwayat Jurnal Guru ({selectedClass})</h4>
              {filteredTeacherJournals.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-emerald-50 text-center text-slate-400 italic">
                  Belum ada jurnal guru untuk kelas ini.
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredTeacherJournals.map((tj) => (
                    <motion.div 
                      key={tj.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-8 rounded-3xl shadow-md border border-emerald-50"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{tj.date}</span>
                          <h5 className="text-xl font-bold text-emerald-900">{tj.tema}</h5>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{tj.class}</span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Tujuan</h6>
                            <p className="text-sm text-slate-700">{tj.tujuan}</p>
                          </div>
                          <div>
                            <h6 className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Metode</h6>
                            <p className="text-sm text-slate-700">{tj.metode}</p>
                          </div>
                          <div>
                            <h6 className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Aktivitas Murid</h6>
                            <p className="text-sm text-slate-700">{tj.aktivitas}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Hasil / Respon</h6>
                            <p className="text-sm text-slate-700">{tj.hasil}</p>
                          </div>
                          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50">
                            <h6 className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Refleksi Guru</h6>
                            <p className="text-sm text-emerald-900 italic">"{tj.refleksi}"</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'nilai' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-emerald-800">Input Nilai Siswa</h3>
                <button 
                  onClick={downloadRekapNilai}
                  className="bg-white text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <Download size={16} /> Rekap Excel
                </button>
              </div>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 rounded-xl border border-emerald-200 bg-white font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto -mx-8 px-8 pb-4">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-wider font-bold">
                    <th className="px-4 py-3 border-b border-emerald-100 sticky left-0 bg-emerald-50 z-10">No</th>
                    <th className="px-4 py-3 border-b border-emerald-100 sticky left-12 bg-emerald-50 z-10">Nama Murid</th>
                    <th className="px-2 py-3 border-b border-emerald-100 text-center">Sholat Dhuha</th>
                    <th className="px-2 py-3 border-b border-emerald-100 text-center">Tadarus</th>
                    <th className="px-2 py-3 border-b border-emerald-100 text-center">Hafalan Doa</th>
                    <th className="px-2 py-3 border-b border-emerald-100 text-center">Asmaul Husna</th>
                    <th className="px-2 py-3 border-b border-emerald-100 text-center">BTQ</th>
                    <th className="px-2 py-3 border-b border-emerald-100 text-center">Akhlak</th>
                    <th className="px-2 py-3 border-b border-emerald-100 text-center">Kepedulian</th>
                    <th className="px-2 py-3 border-b border-emerald-100 text-center bg-emerald-100">Nilai Akhir</th>
                    <th className="px-4 py-3 border-b border-emerald-100">Catatan Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-slate-400 italic">Belum ada data siswa di kelas ini.</td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, i) => (
                      <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-500 sticky left-0 bg-white group-hover:bg-emerald-50/30">{i + 1}</td>
                        <td className="px-4 py-3 font-bold text-emerald-900 text-sm sticky left-12 bg-white group-hover:bg-emerald-50/30">{s.name}</td>
                        <td className="px-2 py-3">
                          <input 
                            type="number" 
                            value={getGradeValue(s.id, 'sholat')}
                            onChange={(e) => updateGrade(s.id, 'sholat', e.target.value)}
                            className="w-16 mx-auto block px-2 py-1 rounded-lg border border-emerald-100 text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0-100"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input 
                            type="number" 
                            value={getGradeValue(s.id, 'tadarus')}
                            onChange={(e) => updateGrade(s.id, 'tadarus', e.target.value)}
                            className="w-16 mx-auto block px-2 py-1 rounded-lg border border-emerald-100 text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0-100"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input 
                            type="number" 
                            value={getGradeValue(s.id, 'doa')}
                            onChange={(e) => updateGrade(s.id, 'doa', e.target.value)}
                            className="w-16 mx-auto block px-2 py-1 rounded-lg border border-emerald-100 text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0-100"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input 
                            type="number" 
                            value={getGradeValue(s.id, 'asmaul')}
                            onChange={(e) => updateGrade(s.id, 'asmaul', e.target.value)}
                            className="w-16 mx-auto block px-2 py-1 rounded-lg border border-emerald-100 text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0-100"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input 
                            type="number" 
                            value={getGradeValue(s.id, 'btq')}
                            onChange={(e) => updateGrade(s.id, 'btq', e.target.value)}
                            className="w-16 mx-auto block px-2 py-1 rounded-lg border border-emerald-100 text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0-100"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input 
                            type="number" 
                            value={getGradeValue(s.id, 'akhlak')}
                            onChange={(e) => updateGrade(s.id, 'akhlak', e.target.value)}
                            className="w-16 mx-auto block px-2 py-1 rounded-lg border border-emerald-100 text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0-100"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input 
                            type="number" 
                            value={getGradeValue(s.id, 'peduli')}
                            onChange={(e) => updateGrade(s.id, 'peduli', e.target.value)}
                            className="w-16 mx-auto block px-2 py-1 rounded-lg border border-emerald-100 text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0-100"
                          />
                        </td>
                        <td className="px-2 py-3 bg-emerald-50/50">
                          <div className="w-16 mx-auto text-center font-bold text-emerald-700 text-sm">
                            {calculateFinal(s.id)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            value={getGradeValue(s.id, 'note')}
                            onChange={(e) => updateGrade(s.id, 'note', e.target.value)}
                            className="w-full px-3 py-1 rounded-lg border border-emerald-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Catatan perkembangan..."
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4">
              <button className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-800 transition-all flex items-center gap-2">
                Simpan Semua Nilai <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [studentUser, setStudentUser] = useState<string | null>(null);
  const [teacherUser, setTeacherUser] = useState<string | null>(null);
  const [students, setStudents] = useState([
    { id: 1, name: 'Ahmad Fauzi', username: 'ahmad', class: 'Kelas 4' },
    { id: 2, name: 'Siti Aminah', username: 'siti', class: 'Kelas 5' },
    { id: 3, name: 'Putra Galuh', username: 'putra', class: 'Kelas 5' },
  ]);
  const [grades, setGrades] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [teacherJournals, setTeacherJournals] = useState<any[]>([]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home journals={journals} />} />
            <Route path="/program" element={<Program />} />
            <Route path="/jadwal" element={<Jadwal />} />
            <Route path="/materi" element={<Materi />} />
            <Route 
              path="/jurnal-siswa" 
              element={
                studentUser 
                  ? <JurnalSiswa 
                      user={studentUser} 
                      onLogout={() => setStudentUser(null)} 
                      journals={journals}
                      setJournals={setJournals}
                    /> 
                  : <Login type="siswa" onLogin={setStudentUser} students={students} />
              } 
            />
            <Route 
              path="/guru" 
              element={
                teacherUser 
                  ? <TeacherMenu 
                      user={teacherUser} 
                      onLogout={() => setTeacherUser(null)} 
                      students={students}
                      setStudents={setStudents}
                      grades={grades}
                      setGrades={setGrades}
                      journals={journals}
                      setJournals={setJournals}
                      teacherJournals={teacherJournals}
                      setTeacherJournals={setTeacherJournals}
                    /> 
                  : <Login type="guru" onLogin={setTeacherUser} />
              } 
            />
          </Routes>
        </main>
        
        <footer className="bg-emerald-950 text-emerald-400 py-12 px-4">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-bold mb-4">SDN 1 Ciparigi</h4>
              <p className="text-sm leading-relaxed">
                Mencetak generasi cerdas, berakhlak mulia, dan bertaqwa kepada Allah SWT.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Kontak</h4>
              <p className="text-sm">Jl. Raya Ciparigi No. 123</p>
              <p className="text-sm">Kabupaten Ciamis, Jawa Barat</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Tautan Cepat</h4>
              <div className="flex flex-wrap gap-2">
                <Link to="/" className="text-xs bg-emerald-900 px-3 py-1 rounded-full hover:bg-emerald-800">Beranda</Link>
                <Link to="/program" className="text-xs bg-emerald-900 px-3 py-1 rounded-full hover:bg-emerald-800">Program</Link>
                <Link to="/guru" className="text-xs bg-emerald-900 px-3 py-1 rounded-full hover:bg-emerald-800">Guru</Link>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-emerald-900 text-center text-xs opacity-50">
            &copy; 2026 Dirasah Smart School. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}
