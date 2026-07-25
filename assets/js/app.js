'use strict';

/* ==========================================================================
   DESA TADOY INDUK — app.js
   Mengelola seluruh konten dinamis desa (Array of Objects) dan me-render-nya
   ke DOM. Juga menangani interaksi UI: hamburger menu, navbar on scroll,
   animasi reveal, animasi counter statistik, dan tombol back-to-top.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. DATA SOURCE — Array of Objects
   -------------------------------------------------------------------------- */

/**
 * Lini masa sejarah & budaya Desa Tadoy Induk.
 * Setiap entri mewakili satu babak dalam perjalanan desa.
 *
 * TODO — BELUM DIVALIDASI KE SUMBER DESA:
 * 1) Era ditulis tematik (bukan tahun spesifik) karena tidak ada tanggal pasti
 *    yang diberikan. Koordinasikan dengan tokoh adat / perangkat desa untuk
 *    memastikan urutan & detail sejarah Totabuan-Bogani, lalu isi tahun bila ada.
 * 2) Entri "Pemekaran Menjadi Dua Desa" perlu dilengkapi tahun resmi dan nomor
 *    SK/Perda pemekaran (tanyakan ke Kaur Pemerintahan / arsip desa).
 * 3) Kecamatan yang tercantum di seluruh situs sudah diubah ke "Bolaang Timur"
 *    berdasarkan data publik (Wikipedia, BPK RI, portal berita lokal), namun
 *    tetap perlu konfirmasi resmi sebelum go-live.
 */
const timelineData = [
  {
    era: 'Akar Peradaban',
    icon: 'fa-solid fa-torii-gate',
    title: 'Peradaban Totabuan Kuno',
    description:
      'Wilayah yang kini menjadi Tadoy Induk tumbuh dari peradaban Totabuan kuno, fondasi budaya yang menyatukan masyarakat di jazirah Bolaang Mongondow.',
  },
  {
    era: 'Kepemimpinan Adat',
    icon: 'fa-solid fa-mountain-sun',
    title: 'Masa Kepemimpinan Para Bogani',
    description:
      'Kehidupan sosial dan adat diarahkan oleh para Bogani — pemimpin adat yang kuat dan bijaksana, penjaga nilai musyawarah dan keseimbangan alam.',
  },
  {
    era: 'Harmonisasi Budaya',
    icon: 'fa-solid fa-water',
    title: 'Pertemuan Pesisir dan Pedalaman',
    description:
      'Posisi geografis Tadoy Induk menyatukan dua watak budaya: keterbukaan masyarakat pesisir Bolaang dan kedalaman tradisi pedalaman Mongondow.',
  },
  {
    era: 'Penataan Wilayah',
    icon: 'fa-solid fa-map-location-dot',
    title: 'Pemekaran Menjadi Dua Desa',
    description:
      'Melalui proses pemekaran wilayah, lahirlah Desa Tadoy Induk sebagai desa induk berdampingan dengan Desa Tadoy I, memperkuat tata kelola dan pelayanan warga.',
  },
  {
    era: 'Masa Kini',
    icon: 'fa-solid fa-seedling',
    title: 'Tadoy Induk Hari Ini',
    description:
      'Kini Tadoy Induk berkembang sebagai desa dengan tata kelola mandiri, menjaga warisan Bogani sekaligus membangun potensi ekonomi generasi baru.',
  },
];

/**
 * Data statistik demografi. `target` adalah angka murni untuk animasi counter,
 * `suffix`/`prefix` adalah elemen tampilan di sekitar angka.
 *
 * TODO: lengkapi field `note` atau tambahkan keterangan terpisah di UI berupa
 * sumber & tahun data resmi (mis. "Data Kependudukan Desember 2025 — Kantor
 * Desa Tadoy Induk") begitu sudah dikonfirmasi, supaya angka ini punya rujukan
 * yang jelas bagi pengunjung situs.
 */
const statsData = [
  {
    icon: 'fa-solid fa-users',
    label: 'Jumlah Penduduk',
    prefix: '±',
    target: 1700,
    suffix: '',
    note: 'jiwa terdaftar',
  },
  {
    icon: 'fa-solid fa-house-chimney',
    label: 'Kepala Keluarga',
    prefix: '',
    target: 481,
    suffix: '',
    note: 'unit KK aktif',
  },
  {
    icon: 'fa-solid fa-code-branch',
    label: 'Desa Hasil Pemekaran',
    prefix: '',
    target: 2,
    suffix: '',
    note: 'Tadoy Induk & Tadoy I',
  },
  {
    icon: 'fa-solid fa-map',
    label: 'Wilayah Administratif',
    prefix: '',
    target: 1,
    suffix: '',
    note: 'Kecamatan Bolaang',
  },
];

/**
 * Tiga pilar potensi ekonomi Desa Tadoy Induk.
 */
const potensiData = [
  {
    icon: 'fa-solid fa-seedling',
    title: 'Pertanian & Perkebunan Kelapa',
    description:
      'Lahan perkebunan kelapa menjadi tulang punggung ekonomi warga, diolah menjadi kopra berkualitas tinggi sebagai komoditas unggulan desa.',
    tag: 'Kopra Berkualitas',
  },
  {
    icon: 'fa-solid fa-fish-fins',
    title: 'Perikanan Tangkap',
    description:
      'Kedekatan dengan pesisir pantai utara membuka peluang besar bagi nelayan lokal melalui aktivitas perikanan tangkap yang berkelanjutan.',
    tag: 'Pesisir Utara',
  },
  {
    icon: 'fa-solid fa-route',
    title: 'Jalur Logistik Strategis',
    description:
      'Dilewati jalur logistik yang strategis, Tadoy Induk memiliki akses distribusi hasil bumi yang menghubungkan desa dengan pasar yang lebih luas.',
    tag: 'Akses Distribusi',
  },
];

/* --------------------------------------------------------------------------
   2. RENDER FUNCTIONS — DOM Manipulation
   -------------------------------------------------------------------------- */

/**
 * Merender lini masa sejarah ke dalam #timeline-container.
 * Item berselang-seling kiri/kanan pada layar desktop (grid 2 kolom),
 * dan menumpuk vertikal pada layar mobile.
 */
function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = '';

  // Garis vertikal tengah (hanya tampak di layar besar)
  const spine = document.createElement('div');
  spine.className = 'timeline-line hidden md:block absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2';
  container.appendChild(spine);

  const list = document.createElement('div');
  list.className = 'flex flex-col gap-10 md:gap-6 relative';

  timelineData.forEach((item, index) => {
    const isEven = index % 2 === 0;

    const row = document.createElement('div');
    row.className = 'reveal grid md:grid-cols-2 md:gap-10 items-center';

    const card = document.createElement('div');
    card.className =
      'bg-white rounded-2xl shadow-card border border-sand-200 p-6 sm:p-7 hover:-translate-y-1 hover:shadow-soft transition-all duration-300';
    card.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <span class="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-gold-500">
          <i class="${item.icon}"></i>
        </span>
        <span class="font-mono-data text-[11px] uppercase tracking-[0.18em] text-gold-600">${item.era}</span>
      </div>
      <h3 class="font-display text-xl font-semibold text-emerald-950">${item.title}</h3>
      <p class="mt-2 text-sm text-ink-700 leading-relaxed">${item.description}</p>
    `;

    const spacer = document.createElement('div');
    spacer.className = 'hidden md:block';

    if (isEven) {
      row.appendChild(card);
      row.appendChild(spacer);
    } else {
      row.appendChild(spacer);
      row.appendChild(card);
    }

    list.appendChild(row);
  });

  container.appendChild(list);
}

/**
 * Merender kartu statistik demografi ke dalam #stats-container,
 * lengkap dengan atribut data-target yang dipakai animasi counter.
 */
function renderStats() {
  const container = document.getElementById('stats-container');
  if (!container) return;

  container.innerHTML = '';

  statsData.forEach((stat) => {
    const card = document.createElement('div');
    card.className =
      'reveal bg-sand-50/[0.06] border border-sand-50/10 rounded-2xl p-7 hover:bg-sand-50/[0.1] transition-colors duration-300';

    card.innerHTML = `
      <span class="w-11 h-11 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center text-lg mb-5">
        <i class="${stat.icon}"></i>
      </span>
      <p class="font-mono-data text-4xl font-semibold text-sand-50">
        <span>${stat.prefix}</span><span class="stat-counter" data-target="${stat.target}">0</span><span>${stat.suffix}</span>
      </p>
      <p class="mt-2 text-sm font-medium text-sand-100">${stat.label}</p>
      <p class="text-xs text-sand-200/60 mt-1">${stat.note}</p>
    `;

    container.appendChild(card);
  });
}

/**
 * Merender kartu potensi ekonomi ke dalam #potensi-container.
 */
function renderPotensi() {
  const container = document.getElementById('potensi-container');
  if (!container) return;

  container.innerHTML = '';

  potensiData.forEach((item) => {
    const card = document.createElement('div');
    card.className =
      'reveal group bg-white rounded-2xl border border-sand-200 shadow-card p-8 hover:-translate-y-1.5 hover:shadow-soft transition-all duration-300';

    card.innerHTML = `
      <span class="w-14 h-14 rounded-2xl bg-emerald-950 group-hover:bg-gold-500 flex items-center justify-center text-2xl text-gold-500 group-hover:text-emerald-950 transition-colors duration-300">
        <i class="${item.icon}"></i>
      </span>
      <span class="inline-block mt-6 font-mono-data text-[11px] uppercase tracking-[0.18em] text-gold-600">${item.tag}</span>
      <h3 class="mt-2 font-display text-xl font-semibold text-emerald-950">${item.title}</h3>
      <p class="mt-3 text-sm text-ink-700 leading-relaxed">${item.description}</p>
    `;

    container.appendChild(card);
  });
}

/**
 * Mengelola video latar hero yang bergantian otomatis: video-1 → video-2 →
 * video-3 → kembali ke video-1, dan seterusnya. Menggunakan satu elemen
 * <video> yang src-nya diganti (bukan memuat 3 video sekaligus), supaya
 * hemat bandwidth — terutama penting untuk pengunjung dengan koneksi
 * seluler terbatas di area pedesaan.
 *
 * Penanganan lintas perangkat:
 * - Memilih sumber resolusi mobile (720px) atau desktop (1280px) sesuai
 *   lebar layar, supaya perangkat kecil tidak mengunduh video besar.
 * - Menghormati "Hemat Data" (Data Saver) dan koneksi lambat (2G/slow-2G)
 *   dengan langsung menampilkan gambar statis, bukan memutar video.
 * - Menghormati preferensi "prefers-reduced-motion" pengguna.
 * - Jika autoplay diblokir browser (kebijakan sebagian browser desktop),
 *   otomatis beralih ke gambar fallback tanpa membuat error terlihat.
 */
function initHeroVideo() {
  const video = document.getElementById('hero-video');
  const fallback = document.getElementById('hero-fallback');
  if (!video || !fallback) return;

  const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Deteksi koneksi lambat / mode hemat data (Network Information API — didukung
  // sebagian browser; jika tidak tersedia, anggap koneksi normal).
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection =
    connection &&
    (connection.saveData === true || ['slow-2g', '2g'].includes(connection.effectiveType));

  const basePath = isMobileViewport ? 'assets/video/mobile/' : 'assets/video/';
  const heroVideoSources = [`${basePath}hero-1.mp4`, `${basePath}hero-2.mp4`, `${basePath}hero-3.mp4`];

  const showFallbackImage = () => {
    video.classList.add('hidden');
    fallback.classList.remove('hidden');
  };

  // Untuk pengguna hemat data / koneksi lambat / preferensi reduced-motion,
  // tampilkan gambar statis saja — jangan putar video sama sekali.
  if (isSlowConnection || prefersReducedMotion) {
    showFallbackImage();
    return;
  }

  let currentIndex = 0;

  const playCurrentVideo = () => {
    video.src = heroVideoSources[currentIndex];
    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay diblokir browser — tampilkan gambar statis sebagai gantinya.
        showFallbackImage();
      });
    }
  };

  video.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % heroVideoSources.length;
    playCurrentVideo();
  });

  // Jika terjadi error memuat salah satu video (file rusak/tidak ditemukan),
  // lewati ke video berikutnya alih-alih membiarkan layar hero kosong.
  video.addEventListener('error', () => {
    if (currentIndex < heroVideoSources.length - 1) {
      currentIndex += 1;
      playCurrentVideo();
    } else {
      showFallbackImage();
    }
  });

  playCurrentVideo();
}

/* --------------------------------------------------------------------------
   3. UI INTERACTIONS
   -------------------------------------------------------------------------- */

/**
 * Toggle hamburger menu untuk navigasi mobile, termasuk animasi ikon
 * menjadi silang (X) dan pembaruan atribut aria-expanded untuk aksesibilitas.
 */
function initHamburgerMenu() {
  const btn = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  const bars = btn.querySelectorAll('.hb-bar');

  const closeMenu = () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    bars[0].style.transform = '';
    bars[1].style.opacity = '1';
    bars[2].style.transform = '';
  };

  const openMenu = () => {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    bars[0].style.transform = 'translateY(6.5px) rotate(45deg)';
    bars[1].style.opacity = '0';
    bars[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
  };

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Tutup menu otomatis saat salah satu tautan diklik
  document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

/**
 * Menambahkan bayangan & latar solid pada navbar ketika halaman discroll,
 * agar navbar tetap terbaca di atas konten hero yang gelap.
 */
function initNavbarOnScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const toggleShadow = () => {
    if (window.scrollY > 24) {
      navbar.classList.add('shadow-md', 'border-sand-300/60');
    } else {
      navbar.classList.remove('shadow-md', 'border-sand-300/60');
    }
  };

  toggleShadow();
  window.addEventListener('scroll', toggleShadow, { passive: true });
}

/**
 * Mengungkap elemen bertanda kelas `.reveal` dengan animasi fade-up
 * saat elemen tersebut memasuki viewport, menggunakan IntersectionObserver.
 */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/**
 * Menjalankan animasi hitung naik (count-up) pada angka statistik
 * ketika bagian Demografi terlihat di layar. Menghormati preferensi
 * pengguna yang mengaktifkan "prefers-reduced-motion".
 */
function initCounterAnimation() {
  const statsSection = document.getElementById('demografi');
  const counters = document.querySelectorAll('.stat-counter');
  if (!statsSection || !counters.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString('id-ID');
      return;
    }

    const duration = 1400;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString('id-ID');

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counters.forEach(animateCounter);
          obs.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(statsSection);
}

/**
 * Menampilkan tombol "kembali ke atas" setelah pengguna scroll melewati
 * satu tinggi layar, dan menanganinya menuju bagian atas halaman.
 */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const toggleVisibility = () => {
    if (window.scrollY > window.innerHeight * 0.6) {
      btn.classList.remove('opacity-0', 'pointer-events-none');
      btn.classList.add('opacity-100');
    } else {
      btn.classList.add('opacity-0', 'pointer-events-none');
      btn.classList.remove('opacity-100');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Menyisipkan tahun berjalan secara otomatis ke dalam teks hak cipta footer.
 */
function initCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
}

/**
 * Menyoroti tautan navigasi aktif sesuai bagian halaman yang sedang
 * dilihat pengguna, memberi konteks lokasi baca yang jelas.
 */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('main section, section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('text-emerald-800', isActive);
            link.classList.toggle('font-semibold', isActive);
          });
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------------------------
   4. INITIALIZATION
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Render seluruh konten dinamis dari data desa
  renderTimeline();
  renderStats();
  renderPotensi();

  // Aktifkan seluruh interaksi UI
  initHeroVideo();
  initHamburgerMenu();
  initNavbarOnScroll();
  initScrollReveal();
  initCounterAnimation();
  initBackToTop();
  initCurrentYear();
  initActiveNavHighlight();
});