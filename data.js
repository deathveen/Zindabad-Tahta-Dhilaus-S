/* ==========================================================
   DATA — Kitab Turats & Profil
   Sumber teks: "copy writing buku/penjelasan buku buku.docx".
   Silsilah LIPIA (Nahwu & Sharaf, Ta'bir, Qira'ah) ditulis
   satu entri per silsilah, mengikuti dokumen itu.
   Dipisah dari engine supaya gampang diedit.
   ========================================================== */
const BOOKS_DATA = [
  // === FAN NAHWU & SHARAF (Tata Bahasa Arab) ===
  {
    id: "nahwu_ajurrumiyyah", title: "Matan Al-Ajurrumiyyah", shortTitle: "Ajurrumiyyah", arabicTitle: "متن الآجرومية",
    category: "nahwu", categoryName: "Fan Nahwu & Sharaf",
    author: "Ibnu Ajurrum", teacher: "Ust. Alif & Ust. Agus",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Matan dasar nahwu paling populer di dunia Islam. Membahas klasifikasi kalam, tanda-tanda i'rab (rafa', nashab, khafadh, jazm), amil-amil pembentuk i'rab, serta kelompok isim-isim yang dibaca marfu', manshub, dan majrur.",
    story: "Sangat paham sampai sempat diamanahi halaqoh mengajar adik kelas."
  },
  {
    id: "nahwu_tuhfah", title: "At-Tuhfah As-Saniyyah", shortTitle: "Tuhfah Saniyyah", arabicTitle: "التحفة السنية",
    category: "nahwu", categoryName: "Fan Nahwu & Sharaf",
    author: "Syekh Muhyiddin Abdul Hamid", teacher: "Ust. Baist",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Mulazamah)", status: "Tamat Dipelajari & Dikaji",
    desc: "Syarah kontemporer atas Ajurrumiyyah. Ciri khasnya adalah penguraian yang jernih, bagan sistematis, serta latihan soal (tamrinat) dan contoh i'rab praktis di setiap akhir bab.",
    story: "Cukup paham kaidah dan tathbiq i'rob."
  },
  {
    id: "nahwu_mutammimah", title: "Mutammimah Al-Ajurrumiyyah", shortTitle: "Mutammimah", arabicTitle: "متممة الآجرومية",
    category: "nahwu", categoryName: "Fan Nahwu & Sharaf",
    author: "Syamsuddin Ar-Ra'ini / Al-Haththab", teacher: "Ust. Alif",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Mulazamah)", status: "Tamat Dipelajari & Dikaji",
    desc: "Kitab penyempurna Ajurrumiyyah. Menambahkan bab-bab penting yang belum dibahas di matan dasar, seperti isim ghair munsharif, af'alul muqarabah, istitsna', serta rincian fungsi huruf.",
    story: "Pernah tamat dipelajari dan dikaji di pondok."
  },
  {
    id: "lughah_silsilah_lipia", title: "Silsilah Ta'lim Al-Lughah Al-Arabiyyah (Nahwu & Sharaf, Jilid 1–4)", shortTitle: "Silsilah Nahwu", arabicTitle: "سلسلة تعليم اللغة العربية",
    category: "nahwu", categoryName: "Fan Nahwu & Sharaf",
    author: "Tim Pengajar LIPIA / Universitas Islam Imam Muhammad", teacher: "Ustadz-ustadz muda sampai ustadz senior",
    period: "Mustawa I–IV", place: "Ma'had LIPIA", status: "Tamat Dipelajari & Dikaji",
    desc: "Modul bahasa modern yang memadukan kaidah teoritis klasik dengan pendekatan pedagogis aplikatif melalui teks bacaan tematik dan latihan bertahap.",
    story: "Menguasai dengan baik asal murojaah aja. Jilid akhirnya berat di mufradat kaya & teks panjang dan mufrodat yang terlalu asing jarang dipakai sehari-hari. Kaidah I'lal, Ibdal, dan Idgham yang rumit memerlukan latihan tathbiq intensif."
  },
  {
    id: "sharaf_amtsilah", title: "Al-Amtsilah At-Tashrifiyyah", shortTitle: "Amtsilah Tashrif", arabicTitle: "الأمثلة التصريفية",
    category: "sharaf", categoryName: "Fan Nahwu & Sharaf",
    author: "KH. Muhammad Ma'shum bin Ali", teacher: "Ust. Salim (Mudir Pondok, diulang 2x)",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Kitab rujukan perubahan kata (sharaf). Memuat tabel sistematis tasrif ishtilahi (perubahan wazan kata) dan tasrif lughawi (perubahan berdasarkan dhomir/pelaku) dari kata kerja lampau (madhi) hingga isim alat dan zaman/makan.",
    story: "Paham konsep evolusi makna & perubahan kata, tapi sering terpeleset di tashrif lisan."
  },

  // === FAN KETERAMPILAN BAHASA (Maharah Lughawiyyah) ===
  {
    id: "lughah_tabir", title: "Silsilah Ta'lim Al-Lughah: Ta'bir (Jilid 1–4)", shortTitle: "Silsilah Ta'bir", arabicTitle: "سلسلة التعبير",
    category: "lughah", categoryName: "Fan Keterampilan Bahasa",
    author: "Tim Pengajar LIPIA / Universitas Islam Imam Muhammad", teacher: "Ustadz-ustadz muda sampai ustadz senior",
    period: "Mustawa I–IV", place: "Ma'had LIPIA", status: "Tamat Dipelajari & Dikaji",
    desc: "Modul untuk melatih keterampilan menulis (insya'), merangkai kalimat, menyusun paragraf tematik, dan kecakapan bercakap (muhadatsah).",
    story: "Menguasai dengan baik asal murojaah aja. Jilid akhirnya berat di mufradat kaya & teks panjang dan mufrodat yang terlalu asing jarang dipakai sehari-hari."
  },
  {
    id: "lughah_qiraah", title: "Silsilah Ta'lim Al-Lughah: Qira'ah (Jilid 1–4)", shortTitle: "Silsilah Qira'ah", arabicTitle: "سلسلة القراءة",
    category: "lughah", categoryName: "Fan Keterampilan Bahasa",
    author: "Tim Pengajar LIPIA / Universitas Islam Imam Muhammad", teacher: "Ustadz-ustadz muda sampai ustadz senior",
    period: "Mustawa I–IV", place: "Ma'had LIPIA", status: "Tamat Dipelajari & Dikaji",
    desc: "Modul literasi membaca dan pemahaman teks bahasa Arab. Menyajikan artikel sejarah, sains Islam, dan adab dengan tingkat kekayaan kosakata (mufradat) yang bertambah kompleks di jilid akhir.",
    story: "Menguasai dengan baik asal murojaah aja. Jilid akhirnya berat di mufradat kaya & teks panjang dan mufrodat yang terlalu asing jarang dipakai sehari-hari."
  },

  // === FAN BAHASA ARAB & KETERAMPILAN MENULIS (Tambahan) ===
  {
    id: "lughah_durusul", title: "Durusul Lughah Al-Arabiyyah (Semua Jilid)", shortTitle: "Durusul Lughah", arabicTitle: "دروس اللغة العربية",
    category: "lughah", categoryName: "Fan Bahasa Arab & Keterampilan Menulis",
    author: "Dr. V. Abdur Rahim / versi adaptasi Gontor", teacher: "",
    period: "", place: "", status: "Tamat Dipelajari & Dikaji",
    desc: "Kitab standar pengajaran bahasa Arab bagi penutur non-Arab dengan metode induktif langsung (tariqah mubasyarah). Versi Arab asli (Madinah Series) mengajarkan pola kalimat dan nahwu aplikatif tanpa rumus rumit di awal, bertahap dari pengenalan isim isyarah dasar hingga struktur kalimat kompleks dan balaghah di jilid akhir. Versi KMI Gontor disusun berjenjang dengan pendekatan komunikatif-aktif, diperkaya latihan percakapan harian (muhadatsah), variasi kalimat (insya'), dan kosakata kontekstual kehidupan santri.",
    story: ""
  },
  {
    id: "lughah_imla", title: "Qawa'idul Imla'", shortTitle: "Qawa'idul Imla'", arabicTitle: "قواعد الإملاء",
    category: "lughah", categoryName: "Fan Bahasa Arab & Keterampilan Menulis",
    author: "", teacher: "",
    period: "", place: "", status: "Tamat Dipelajari & Dikaji",
    desc: "Kitab panduan teknis penulisan ortografi/ejaan bahasa Arab yang benar. Fokus pembahasannya meliputi penulisan hamzah (hamzah washal dan qath', hamzah di awal, tengah, dan akhir kata), alif layyinah/alif maqshurah, kaidah huruf yang dibaca tapi tidak ditulis (seperti kata dzalika atau laakin), serta huruf yang ditulis tapi tidak dibaca (seperti alif pada wawu jama'ah).",
    story: ""
  },

  // === FAN FIQIH & METODOLOGI HUKUM ===
  {
    id: "fiqih_syuja", title: "Matan Al-Ghayah wat Taqrib / Abu Syuja'", shortTitle: "Matan Abu Syuja", arabicTitle: "متن الغاية والتقريب",
    category: "fiqih", categoryName: "Fan Fiqih & Metodologi Hukum",
    author: "Al-Qadhi Abu Syuja' Al-Ashfahani", teacher: "Ust. Salim (Mudir Pondok)",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Mulazamah)", status: "Tamat Dipelajari & Dikaji",
    desc: "Matan ringkas induk fiqih madzhab Syafi'i. Mencakup seluruh bab hukum Islam mulai dari thaharah, salat, zakat, puasa, haji, muamalah, nikah, jinayat, hingga faraidh (pembagian waris).",
    story: "Sangat menguasai, lulus ujian akhir, faraidh paham total."
  },
  {
    id: "fiqih_imta", title: "Al-Imta' bi Syarh Matn Abi Syuja'", shortTitle: "Al-Imta' Syarah", arabicTitle: "الإمتاع بشرح متن أبي شجاع",
    category: "fiqih", categoryName: "Fan Fiqih & Metodologi Hukum",
    author: "Syekh Hisyam Al-Kamil Hamid", teacher: "Ust. Salim (Mudir Pondok)",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Mulazamah)", status: "Tamat Dipelajari & Dikaji",
    desc: "Syarah modern atas matan Abu Syuja' yang menguraikan dalil Al-Qur'an dan Hadits di setiap pasal serta memberikan contoh kasus kontemporer.",
    story: "Sangat paham syarah, dalil aplikatif, dan uraian cabangnya."
  },
  {
    id: "ushul_waraqat", title: "Matan Al-Waraqat", shortTitle: "Matan Al-Waraqat", arabicTitle: "متن الورقات",
    category: "ushul", categoryName: "Fan Fiqih & Metodologi Hukum",
    author: "Imam Al-Haramain Al-Juwaini", teacher: "Ust. Alif",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Risalah dasar ushul fiqih. Membahas definisi hukum syar'i (wajib, mandub, mubah, makruh, haram), hakikat amar (perintah) dan nahi (larangan), lafal 'am (umum) dan khas (khusus), serta pengantar ijma' dan qiyas.",
    story: "Lewat dan tamat dipelajari."
  },
  {
    id: "ushul_min_ilmil_ushul", title: "Al-Ushul min 'Ilmil Ushul", shortTitle: "Ushul min Ilmil Ushul", arabicTitle: "الأصول من علم الأصول",
    category: "ushul", categoryName: "Fan Fiqih & Metodologi Hukum",
    author: "Syekh Muhammad bin Shalih Al-'Utsaimin", teacher: "Ust. Salim (Mudir Pondok)",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Pengantar ushul fiqih yang disusun dengan metode poin-poin terstruktur. Membahas kaidah dalil hukum, dalalah lafal, ta'arudh (kontradiksi dalil), tarjih, serta syarat ijtihad dan fatwa.",
    story: "Sangat jago dan terstruktur dalam memahami metodologi istinbath."
  },
  {
    id: "ushul_qawaid_fiqhiyyah", title: "Manzhumah Al-Qawa'id Al-Fiqhiyyah", shortTitle: "Qawa'id Fiqhiyyah", arabicTitle: "منظومة القواعد الفقهية",
    category: "ushul", categoryName: "Fan Fiqih & Metodologi Hukum",
    author: "Syaikh Abdurrahman bin Nashir As-Sa'di", teacher: "Ust. Salim (Mudir Pondok)",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Kumpulan kaidah universal fikih (seperti Al-Umuuru bi Maqashidiha, Al-Yaqiinu la Yazaalu bisy-Syakk) yang berfungsi sebagai rumus induk untuk menghukumi ribuan cabang masalah fiqih.",
    story: "Menyenangkan dan seru, paham kaidah induk/kerangka berpikirnya."
  },

  // === FAN TAUHID & AQIDAH ===
  {
    id: "aqidah_ushul_tsalatsah", title: "Al-Ushul Ats-Tsalatsah", shortTitle: "Ushul Tsalatsah", arabicTitle: "الأصول الثلاثة",
    category: "aqidah", categoryName: "Fan Tauhid & Aqidah",
    author: "Syekh Muhammad bin Abdul Wahhab", teacher: "Ust. Salim",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi & Bersanad)", status: "Tamat Dipelajari & Bersanad",
    desc: "Tiga landasan utama yang akan ditanyakan di alam kubur: mengenal Allah (Ma'rifatullah), mengenal agama Islam beserta tingkatannya (Ma'rifatud Din), dan mengenal Nabi Muhammad (Ma'rifatun Nabi).",
    story: "Sangat paham, fondasi ma'rifatullah-din-nabi mantap, dan bersanad."
  },
  {
    id: "aqidah_qawaid_arba", title: "Al-Qawa'id Al-Arba'", shortTitle: "Qawa'idul Arba'", arabicTitle: "القواعد الأربع",
    category: "aqidah", categoryName: "Fan Tauhid & Aqidah",
    author: "Syekh Muhammad bin Abdul Wahhab", teacher: "Ust. Salim",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi & Bersanad)", status: "Tamat Dipelajari & Bersanad",
    desc: "Empat kaidah kunci untuk membedakan hakikat tauhid dan bentuk-bentuk kesyirikan berdasarkan pemahaman para sahabat dan dalil Al-Qur'an.",
    story: "Sangat paham konsep syirik & tauhid, dan bersanad."
  },
  {
    id: "aqidah_kitabut_tauhid", title: "Kitabut Tauhid", shortTitle: "Kitabut Tauhid", arabicTitle: "كتاب التوحيد",
    category: "aqidah", categoryName: "Fan Tauhid & Aqidah",
    author: "Syekh Muhammad bin Abdul Wahhab", teacher: "Ust. Salim",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi & Bersanad)", status: "Tamat Dipelajari & Bersanad",
    desc: "Kitab tematik yang merinci hak mutlak Allah atas hamba-Nya, urgensi pemurnian ibadah, serta bab-bab bantahan terhadap syirik besar, syirik kecil, sihir, perdukunan, dan tathayyur.",
    story: "Menguasai bab-bab rincian tauhid & pembatalnya, dan bersanad."
  },
  {
    id: "aqidah_wasithiyyah", title: "Al-Aqidah Al-Wasithiyyah", shortTitle: "Aqidah Wasithiyyah", arabicTitle: "العقيدة الواسطية",
    category: "aqidah", categoryName: "Fan Tauhid & Aqidah",
    author: "Ibnu Taimiyyah", teacher: "Ust. Salim",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Risalah aqidah Ahlus Sunnah wal Jama'ah yang memfokuskan pembahasannya pada penetapan nama dan sifat Allah (Asma' wa Shifat) tanpa tahrif, ta'thil, takyif, maupun tamtsil, serta sikap terhadap para sahabat dan hari akhir.",
    story: "Paham kaidah Asma' wa Shifat & pokok manhaj Ahlus Sunnah."
  },
  {
    id: "aqidah_thahawiyyah", title: "Al-Aqidah Ath-Thahawiyyah", shortTitle: "Aqidah Thahawiyyah", arabicTitle: "العقيدة الطحاوية",
    category: "aqidah", categoryName: "Fan Tauhid & Aqidah",
    author: "Imam Abu Ja'far Ath-Thahawi", teacher: "Ust. Alif",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Matan aqidah klasik abad ke-3 H yang merangkum konsensus pokok keimanan Ahlus Sunnah wal Jama'ah lintas madzhab fiqih.",
    story: "Paham matan aqidah klasik lintas madzhab."
  },

  // === FAN HADITS & MUSTHALAH HADITS ===
  {
    id: "hadits_arbain", title: "Al-Arba'in An-Nawawiyyah", shortTitle: "Arba'in Nawawiyyah", arabicTitle: "الأربعون النووية",
    category: "hadits", categoryName: "Fan Hadits & Musthalah Hadits",
    author: "Imam An-Nawawi", teacher: "Halaqoh (Guru berganti-ganti)",
    period: "Thalibul 'Ilmi", place: "Halaqoh Keilmuan (Bersanad)", status: "Tamat Dipelajari & Bersanad",
    desc: "Himpunan 42 hadits jawami'ul kalim yang merangkum poros ajaran Islam, pondasi niat, rukun iman, rukun Islam, serta etika seorang muslim.",
    story: "Sangat paham dan bersanad muttashil."
  },
  {
    id: "hadits_umdah", title: "Umdatul Ahkam", shortTitle: "Umdatul Ahkam", arabicTitle: "عمدة الأحكام",
    category: "hadits", categoryName: "Fan Hadits & Musthalah Hadits",
    author: "Al-Hafizh Abdul Ghani Al-Maqdisi", teacher: "Halaqoh (Guru berganti-ganti)",
    period: "Thalibul 'Ilmi", place: "Halaqoh Keilmuan", status: "Tamat Dipelajari & Dikaji",
    desc: "Kumpulan hadits-hadits hukum fiqih yang secara khusus disepakati keshahihannya oleh Imam Al-Bukhari dan Imam Muslim (Muttafaqun 'Alaih).",
    story: "Paham fiqih haditsnya; pernah hafal matan dan langsung nyambung begitu dibacakan."
  },
  {
    id: "hadits_bulughul_maram", title: "Bulughul Maram min Adillatil Ahkam", shortTitle: "Bulughul Maram", arabicTitle: "بلوغ المرام",
    category: "hadits", categoryName: "Fan Hadits & Musthalah Hadits",
    author: "Al-Hafizh Ibnu Hajar Al-Asqalani", teacher: "Halaqoh (Guru berganti-ganti)",
    period: "Thalibul 'Ilmi", place: "Halaqoh Keilmuan (Sanad Riwayat)", status: "Tamat Dipelajari & Bersanad Riwayat",
    desc: "Kitab referensi hadits hukum terlengkap yang disusun berurutan sesuai bab fiqih, lengkap dengan penjelasan derajat keshahihan dan jalur periwayatan hadits.",
    story: "Khatam mengkaji tuntas dan bersanad riwayat (bukan sanad hafalan)."
  },
  {
    id: "hadits_shahihain", title: "Kutubus Shahihain", shortTitle: "Shahih Bukhari Muslim", arabicTitle: "الصحيحان",
    category: "hadits", categoryName: "Fan Hadits & Musthalah Hadits",
    author: "Al-Bukhari & Muslim", teacher: "Halaqoh (Guru berganti-ganti)",
    period: "Thalibul 'Ilmi", place: "Halaqoh Keilmuan", status: "Tamat Dipelajari & Dikaji",
    desc: "Dua kitab induk hadits tershahih rujukan umat Islam yang memuat ribuan riwayat sabda, perbuatan, dan ketetapan Rasulullah.",
    story: "Paham konteks/makna; memiliki kepekaan rasa bahasa teks (dzauq hadits) untuk mengenali hadits Shahihain saat diperdengarkan."
  },
  {
    id: "musthalah_taisir", title: "Taisir Musthalahil Hadits", shortTitle: "Taisir Musthalah", arabicTitle: "تيسير مصطلح الحديث",
    category: "hadits", categoryName: "Fan Hadits & Musthalah Hadits",
    author: "Dr. Mahmud Ath-Thahhan", teacher: "Ust. Salim",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Buku panduan ilmu musthalah hadits modern. Membahas klasifikasi hadits berdasarkan jumlah jalur (mutawatir & ahad), tingkat penerimaan (shahih, hasan, dha'if), jenis keterputusan sanad, serta ilmu jarh wa ta'dil.",
    story: "Paham konsep dasar klasifikasi hadits; cabang-cabang istilah detail siap aktif kembali jika dimuraja'ah."
  },

  // === FAN AL-QUR'AN, ADAB, & SIRAH ===
  {
    id: "quran_tuhfatul_athfal", title: "Matan Tuhfatul Athfal", shortTitle: "Tuhfatul Athfal", arabicTitle: "متن تحفة الأطفال",
    category: "quran", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "Syekh Sulaiman Al-Jamzuri", teacher: "Ust. Melvin",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dihafal",
    desc: "Nazham syair ringkas kaidah tajwid dasar. Memuat hukum nun sukun dan tanwin, mim dan nun bertasydid, mim sukun, lam ta'rif, perjumpaan dua huruf (matsalain, mutaqaribain, mutajanisain), serta pembagian mad.",
    story: "Pernah hafal mutqin, rekor ujian nulis ulang seluruh matan tanpa cela."
  },
  {
    id: "quran_dauroh", title: "Buku Panduan Dauroh Al-Qur'an (Rasm & Tahsin/Tajwid Lanjutan)", shortTitle: "Dauroh Al-Qur'an", arabicTitle: "",
    category: "quran", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "", teacher: "",
    period: "", place: "Dauroh (bersanad)", status: "Tamat Dipelajari & Dikaji",
    desc: "Buku panduan praktis pegangan dauroh tahsin dan tajwid bersanad (sering kali merujuk pada materi dauroh standar Markaz Al-Qur'an / panduan Syekh Aiman Rusydi Suwaid). Memuat kaidah praktis makharijul huruf, shifatul huruf, hukum waqaf dan ibtida', serta pengenalan kaidah tanda baca rasm utsmani agar bacaan tartil dan presisi sesuai standar qira'at riwayat Hafsh 'an 'Ashim.",
    story: ""
  },
  {
    id: "quran_ushul_tafsir", title: "Ushul fit Tafsir", shortTitle: "Ushul fit Tafsir", arabicTitle: "أصول في التفسير",
    category: "quran", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "Syekh Muhammad bin Shalih Al-'Utsaimin", teacher: "Ust. Salim",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Kaidah dasar penafsiran Al-Qur'an. Membahas tahapan menafsirkan ayat, asbabun nuzul, perbedaan makkiyyah dan madaniyyah, serta cara menyikapi riwayat israiliyyat.",
    story: "Paham standar konsep pengantar tafsir."
  },
  {
    id: "akhlaq_kitabul_jami", title: "Kitabul Jami'", shortTitle: "Kitabul Jami'", arabicTitle: "كتاب الجامع",
    category: "akhlaq", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "Al-Hafizh Ibnu Hajar Al-Asqalani", teacher: "Berganti-ganti ustadz (diulang beberapa kali)",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Bab penutup kitab Bulughul Maram yang memuat hadits-hadits adab pergaulan, akhlak mulia, berbakti kepada orang tua, zuhud, wara', serta dzikir dan doa.",
    story: "Sangat suka materinya, penguasaan materi adab & tazkiyatun nufus kuat."
  },
  {
    id: "akhlaq_hilyah", title: "Hilyah Thalibil 'Ilmi", shortTitle: "Hilyah Thalibil Ilmi", arabicTitle: "حلية طالب العلم",
    category: "akhlaq", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "Syekh Bakr Abu Zaid", teacher: "Ust. Alif",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Risalah adab dan etika penuntut ilmu. Membahas keikhlasan niat, adab terhadap guru, metode membaca kitab, penjagaan kehormatan diri (muru'ah), serta penyakit kesombongan ilmiah.",
    story: "Kosakata klasik/sastranya menantang dan berat, tapi tuntas lulus dipelajari."
  },
  {
    id: "akhlaq_adab_mufrad", title: "Al-Adab Al-Mufrad", shortTitle: "Adab Mufrad", arabicTitle: "الأدب المفرد",
    category: "akhlaq", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "Imam Al-Bukhari", teacher: "",
    period: "", place: "", status: "Tamat Dipelajari & Dikaji",
    desc: "Himpunan hadits adab susunan Imam Al-Bukhari, terpisah dari kitab Shahih-nya. Isinya bab-bab akhlak sehari-hari: berbakti kepada orang tua, menyambung silaturahmi, hak tetangga, adab berbicara, memuliakan tamu, sampai cara memperlakukan anak dan pembantu. Berbeda dengan Shahih Al-Bukhari, derajat riwayat di kitab ini beragam — ada yang shahih, hasan, dan dha'if — jadi penilaian tiap haditsnya tetap perlu dirujuk.",
    story: ""
  },
  {
    id: "akhlaq_adab_mutaallimin", title: "Adab Al-Muta'allimin", shortTitle: "Adab Muta'allimin", arabicTitle: "آداب المتعلمين",
    category: "akhlaq", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "", teacher: "",
    period: "", place: "", status: "Tamat Dipelajari & Dikaji",
    desc: "Risalah adab penuntut ilmu. Membahas niat sebelum belajar, adab terhadap guru dan terhadap kitab, cara memilih pelajaran dan teman duduk, kesungguhan serta pengaturan waktu belajar, dan perkara-perkara yang menghalangi ilmu masuk.",
    story: ""
  },
  {
    id: "sirah_nurul_yaqin", title: "Khulashah Nurul Yaqin (Jilid 1–3)", shortTitle: "Khulashah Nurul Yaqin", arabicTitle: "خلاصة نور اليقين",
    category: "sirah", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "Syekh Umar Abdul Jabbar", teacher: "Ust. Melvin",
    period: "Thalibul 'Ilmi", place: "Pondok Pesantren (Talaqqi)", status: "Tamat Dipelajari & Dikaji",
    desc: "Ringkasan sirah nabawiyah bertingkat dalam bahasa Arab ringkas. Memetakan fase kehidupan Nabi di Makkah, hijrah ke Madinah, ekspedisi militer/dakwah (ghazawat), hingga wafatnya beliau.",
    story: "Sangat jago, menikmati alur cerita kronologi kenabian."
  },
  {
    id: "sirah_rahiq_makhtum", title: "Ar-Rahiq Al-Makhtum", shortTitle: "Ar-Rahiq Al-Makhtum", arabicTitle: "الرحيق المختوم",
    category: "sirah", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "Syekh Shafiyyurrahman Al-Mubarakfuri", teacher: "Pengajar Halaqoh Sirah",
    period: "Thalibul 'Ilmi", place: "Halaqoh Sirah", status: "Tamat Dipelajari & Dikaji",
    desc: "Karya sirah nabawiyah analitis peraih penghargaan internasional. Mengupas kondisi jazirah Arab pra-Islam, kronologi detail dakwah Rasulullah, dinamika politik, hingga strategi perang secara komprehensif.",
    story: "Menikmati narasi sejarahnya secara luas tanpa dibebani hafalan detail silsilah nasab."
  },
  {
    id: "sirah_syamail", title: "Asy-Syamail Al-Muhammadiyyah", shortTitle: "Syamail Muhammadiyah", arabicTitle: "الشمائل المحمدية",
    category: "sirah", categoryName: "Fan Al-Qur'an, Adab, & Sirah",
    author: "Imam At-Tirmidzi", teacher: "Halaqoh Keilmuan",
    period: "Thalibul 'Ilmi", place: "Halaqoh Keilmuan", status: "Tamat Dipelajari & Dikaji",
    desc: "Karya agung yang merinci kepribadian luhur, budi pekerti, sifat fisik, kebiasaan hidup, ibadah, pakaian, dan akhlak mulia Rasulullah صلى الله عليه وسلم.",
    story: "Tuntas dipelajari dan dikaji."
  }
];

// ===== PERMANENT PROFILE DATA =====
const PROFILE_DATA = {
  name: "Zinda",
  fullName: "Zindabad Tahta Dhilaus Suyyuf",
  realm: "RANAH: INTI JIWA TINGKAT IX",
  title: "Penuntut Ilmu Syar'i & Pemegang Sanad Turats",
  studyYears: "4 Tahun",
  totalTeachers: "12+ Guru",
  bio: "",
  whatsapp: "",
  email: "",
  github: "",
  instagram: "",
  timeline: [
    { year: "Tahap I", title: "Nahwu, Sharaf & Keterampilan Lughah", desc: "Mempelajari pondasi bahasa Arab, gramatika, dan morfologi kata." },
    { year: "Tahap II", title: "Tauhid, Fiqih & Ushul Fiqh", desc: "Mempelajari pemurnian aqidah, rukun syariat, dan kaidah istinbath hukum." },
    { year: "Tahap III", title: "Hadits, Ulumul Qur'an, Adab & Sirah", desc: "Mengkaji hadits-hadits shahih, tajwid, etika penuntut ilmu, dan sejarah Rasulullah ﷺ." }
  ]
};
