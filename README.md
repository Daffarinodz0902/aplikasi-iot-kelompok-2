# IoT Dashboard - Modul IOT Kelas C

> Dashboard statis untuk memantau sensor (suhu, kelembapan), kontrol lampu, dan status tombol.

Folder ini berisi halaman statis yang dapat dihosting di GitHub Pages.

Cara cepat deploy ke GitHub Pages:

1. Buat repository baru di GitHub (mis. `iot-dashboard`).
2. Di komputer Anda, buka PowerShell di folder proyek ini.
3. Jalankan perintah berikut (ganti `<git-repo-url>` dengan URL repository Anda):

```powershell
git init
git add .
git commit -m "Initial: IoT Dashboard UI"
git branch -M main
git remote add origin <git-repo-url>
git push -u origin main
```

4. Aktifkan GitHub Pages pada repository: Settings → Pages → Source: `main` branch (root). Tunggu beberapa menit.

Catatan:
- Jika Anda ingin site di-serve dari folder `docs/`, pindahkan file statis ke folder `docs/` dan pilih `docs` sebagai source di GitHub Pages.
- Untuk menggunakan Firebase realtime, edit `assets/js/app.js` dan masukkan `firebaseConfig` Anda.

Enjoy! 🚀
