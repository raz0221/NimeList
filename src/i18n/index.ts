import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const idTranslation = {
  "Beranda": "Beranda",
  "Kirim Ulasan": "Kirim Ulasan",
  "Top Sedang Tayang": "Top Sedang Tayang",
  "Anime terpopuler yang kini sedang on-air": "Anime terpopuler yang kini sedang on-air",
  "Cari judul anime...": "Cari judul anime...",
  "Pengaturan": "Pengaturan",
  "Bahasa": "Bahasa",
  "Pilih bahasa aplikasi": "Pilih bahasa aplikasi",
  "Tersimpan ✅": "Tersimpan ✅",
  "Pengaturan berhasil disimpan!": "Pengaturan berhasil disimpan!",
  "Gagal": "Gagal",
  "Tidak bisa menyimpan pengaturan.": "Tidak bisa menyimpan pengaturan.",
  "Preferensi disimpan ke cloud": "Preferensi disimpan ke cloud",
  "Login untuk menyimpan pengaturan ke cloud": "Login untuk menyimpan pengaturan ke cloud",
  "Notifikasi Push": "Notifikasi Push",
  "Terima notifikasi rilis episode baru": "Terima notifikasi rilis episode baru",
  "Filter Spoiler": "Filter Spoiler",
  "Sembunyikan sinopsis di halaman detail": "Sembunyikan sinopsis di halaman detail",
  "Tampilkan Jumlah Episode": "Tampilkan Jumlah Episode",
  "Tampilkan info episode di setiap card": "Tampilkan info episode di setiap card",
  "Simpan Pengaturan": "Simpan Pengaturan",
  "Login untuk Menyimpan": "Login untuk Menyimpan",
  "Kembali": "Kembali",

  "Pusat Akun": "Pusat Akun",
  "Anda belum masuk. Silakan login untuk fitur lengkap.": "Anda belum masuk. Silakan login untuk fitur lengkap.",
  "Masuk / Login": "Masuk / Login",
  "Daftar Akun Baru": "Daftar Akun Baru",
  "Email Pengguna": "Email Pengguna",
  "User ID (UID)": "User ID (UID)",
  "✏️ Edit Profil": "✏️ Edit Profil",
  "⚙️ Pengaturan Aplikasi": "⚙️ Pengaturan Aplikasi",
  "ℹ️ Tentang Aplikasi": "ℹ️ Tentang Aplikasi",
  "🚪 Keluar Akun": "🚪 Keluar Akun",
  "Terjadi kesalahan saat proses logout.": "Terjadi kesalahan saat proses logout.",

  "🔔 Notifikasi": "🔔 Notifikasi",
  "Selamat datang di AniTrack!": "Selamat datang di AniTrack!",
  "📰 BERITA TERBARU": "📰 BERITA TERBARU",
  "Cek update anime terbaru minggu ini!": "Cek update anime terbaru minggu ini!",
  "Jelajahi Charts": "Jelajahi Charts",
  "Top Rated": "Top Rated",
  "Musiman": "Musiman",
  "Segera Tayang": "Segera Tayang",
  "🔥 Trending Sekarang": "🔥 Trending Sekarang",
  "📅 Lihat Jadwal Lengkap": "📅 Lihat Jadwal Lengkap",

  "Explore Anime": "Explore Anime",
  "Hasil Pencarian": "Hasil Pencarian",
  "Anime tidak ditemukan.": "Anime tidak ditemukan.",
  "Reset Pencarian": "Reset Pencarian",
  "Kategori Genre": "Kategori Genre",
  "Lihat Semua": "Lihat Semua",
  "🌟 Rekomendasi": "🌟 Rekomendasi",
  "Anime spesial": "Anime spesial",
  "🎬 Anime Movie": "🎬 Anime Movie",
  "Film layar lebar": "Film layar lebar",

  "Riwayat": "Riwayat",
  "Silakan login untuk melihat Riwayat Aktivitas.": "Silakan login untuk melihat Riwayat Aktivitas.",
  "Pergi ke Halaman Login": "Pergi ke Halaman Login",
  "🏆 Pencapaian": "🏆 Pencapaian",
  "Catatan aktivitas dan perjalanan animemu.": "Catatan aktivitas dan perjalanan animemu.",
  "Timeline Log": "Timeline Log",
  "Belum ada riwayat aktivitas.": "Belum ada riwayat aktivitas.",
  "Terjadi kesalahan saat mencari anime.": "Terjadi kesalahan saat mencari anime.",

  "Pencapaian & Gelar": "Pencapaian & Gelar",
  "Buka pencapaian dan pasang gelar untuk profilmu": "Buka pencapaian dan pasang gelar untuk profilmu",
  "Edit Profil": "Edit Profil",
  "Simpan Perubahan": "Simpan Perubahan",
  "Nama Tampilan": "Nama Tampilan",
  "Bio (Tentang Kamu)": "Bio (Tentang Kamu)",
  "Hubungi Kami": "Hubungi Kami",
  "Tentang Aplikasi": "Tentang Aplikasi"
};

const enTranslation = {
  "Beranda": "Home",
  "Kirim Ulasan": "Post Review",
  "Top Sedang Tayang": "Top Airing",
  "Anime terpopuler yang kini sedang on-air": "Most popular currently airing anime",
  "Cari judul anime...": "Search anime title...",
  "Pengaturan": "Settings",
  "Bahasa": "Language",
  "Pilih bahasa aplikasi": "Choose app language",
  "Tersimpan ✅": "Saved ✅",
  "Pengaturan berhasil disimpan!": "Settings saved successfully!",
  "Gagal": "Failed",
  "Tidak bisa menyimpan pengaturan.": "Failed to save settings.",
  "Preferensi disimpan ke cloud": "Preferences saved to cloud",
  "Login untuk menyimpan pengaturan ke cloud": "Login to save settings to cloud",
  "Notifikasi Push": "Push Notifications",
  "Terima notifikasi rilis episode baru": "Receive new episode release notifications",
  "Filter Spoiler": "Spoiler Filter",
  "Sembunyikan sinopsis di halaman detail": "Hide synopsis on details page",
  "Tampilkan Jumlah Episode": "Show Episode Count",
  "Tampilkan info episode di setiap card": "Show episode info on every card",
  "Simpan Pengaturan": "Save Settings",
  "Login untuk Menyimpan": "Login to Save",
  "Kembali": "Back",

  "Pusat Akun": "Account Center",
  "Anda belum masuk. Silakan login untuk fitur lengkap.": "You are not logged in. Please login for full features.",
  "Masuk / Login": "Sign In / Login",
  "Daftar Akun Baru": "Create New Account",
  "Email Pengguna": "User Email",
  "User ID (UID)": "User ID (UID)",
  "✏️ Edit Profil": "✏️ Edit Profile",
  "⚙️ App Settings": "⚙️ App Settings",
  "ℹ️ Tentang Aplikasi": "ℹ️ About App",
  "🚪 Keluar Akun": "🚪 Sign Out",
  "Terjadi kesalahan saat proses logout.": "An error occurred during logout.",

  "🔔 Notifikasi": "🔔 Notifications",
  "Selamat datang di AniTrack!": "Welcome to AniTrack!",
  "📰 BERITA TERBARU": "📰 LATEST NEWS",
  "Cek update anime terbaru minggu ini!": "Check out this week's latest anime updates!",
  "Jelajahi Charts": "Explore Charts",
  "Top Rated": "Top Rated",
  "Musiman": "Seasonal",
  "Segera Tayang": "Upcoming",
  "🔥 Trending Sekarang": "🔥 Trending Now",
  "📅 Lihat Jadwal Lengkap": "📅 View Full Schedule",

  "Explore Anime": "Explore Anime",
  "Hasil Pencarian": "Search Results",
  "Anime tidak ditemukan.": "Anime not found.",
  "Reset Pencarian": "Reset Search",
  "Kategori Genre": "Genre Categories",
  "Lihat Semua": "See All",
  "🌟 Rekomendasi": "🌟 Recommendations",
  "Anime spesial": "Special anime",
  "🎬 Anime Movie": "🎬 Anime Movies",
  "Film layar lebar": "Theatrical releases",

  "Riwayat": "History",
  "Silakan login untuk melihat Riwayat Aktivitas.": "Please login to view Activity History.",
  "Pergi ke Halaman Login": "Go to Login Page",
  "🏆 Pencapaian": "🏆 Achievements",
  "Catatan aktivitas dan perjalanan animemu.": "Records of your anime activity and journey.",
  "Timeline Log": "Timeline Log",
  "Belum ada riwayat aktivitas.": "No activity history yet.",
  "Terjadi kesalahan saat mencari anime.": "An error occurred while searching for anime.",

  "Pencapaian & Gelar": "Achievements & Titles",
  "Buka pencapaian dan pasang gelar untuk profilmu": "Unlock achievements and equip titles for your profile",
  "Edit Profil": "Edit Profile",
  "Simpan Perubahan": "Save Changes",
  "Nama Tampilan": "Display Name",
  "Bio (Tentang Kamu)": "Bio (About You)",
  "Hubungi Kami": "Contact Us",
  "Tentang Aplikasi": "About App"
};

const resources = {
  id: { translation: idTranslation },
  en: { translation: enTranslation }
};

i18next
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'id', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18next;
