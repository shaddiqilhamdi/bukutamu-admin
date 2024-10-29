const scriptURL = 'https://script.google.com/macros/s/AKfycbwUMPhelYSDjD-gVUgrQQ6zhGLeLFy2Tw7U9WcIogzMuh76q9TRTV3Xf5EVQM289ANP/exec';

// Fungsi Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan!',
                text: 'Username dan Password wajib diisi.',
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Loading...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const data = new URLSearchParams();
            data.append('type', 'user');
            data.append('action', 'login');
            data.append('username', username);
            data.append('password', password);

            const response = await fetch(scriptURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data,
            });

            const result = await response.json();
            Swal.close();

            if (result.success) {
                localStorage.setItem('authToken', result.data.token);
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil!',
                    text: 'Anda akan diarahkan ke dashboard.',
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal!',
                    text: result.message || 'Username atau Password salah.',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan!',
                text: 'Terjadi kesalahan, silakan coba lagi nanti.',
            });
        }
    });
}

// Fungsi untuk Logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah reload halaman

            // Hapus token dari localStorage
            localStorage.removeItem('authToken');
            console.log("Token dihapus, logout berhasil.");

            // Tampilkan pesan sukses
            Swal.fire({
                icon: 'success',
                title: 'Logout Berhasil!',
                text: 'Anda akan diarahkan ke halaman login.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // Paksa arahkan ke halaman login untuk mencegah cache halaman
                window.location.replace('index.html'); 
            });
        });
    }
});


// Cek Token di Semua Halaman setelah dimuat
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const currentPath = window.location.pathname;

    // Halaman yang memerlukan login
    const protectedPages = [
        'dashboard.html', 
        'profil.html', 
        'bukutamu.html', 
        'pegawai.html',
        'bidang.html',
        'jabatan.html',
        'user.html',
        'userlog.html'];

    if (!token && protectedPages.some(page => currentPath.includes(page))) {
        // Redirect ke halaman login jika tidak ada token di halaman terlindungi
        Swal.fire({
            icon: 'warning',
            title: 'Akses Ditolak!',
            text: 'Harap login terlebih dahulu.',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = 'index.html';
        });
    } else if (token && currentPath.includes('index.html')) {
        // Redirect ke dashboard jika sudah login dan mencoba akses login
        window.location.href = 'dashboard.html';
    }
});

async function userName() {
    const token = localStorage.getItem('authToken'); // Ambil token dari localStorage
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwUMPhelYSDjD-gVUgrQQ6zhGLeLFy2Tw7U9WcIogzMuh76q9TRTV3Xf5EVQM289ANP/exec'; // URL API Anda

    // Cek apakah data user sudah ada di localStorage
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
        // Jika data sudah ada, tampilkan langsung
        const userData = JSON.parse(savedUserData); // Parse JSON dari localStorage
        document.getElementById('userNameDisplay').textContent = userData.nama;
        return; // Tidak perlu memuat ulang dari API
    }

    try {
        // Siapkan data menggunakan URLSearchParams
        const params = new URLSearchParams();
        params.append('type', 'user');
        params.append('action', 'read');
        params.append('token', token);

        // Panggil API dengan fetch
        const response = await fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json(); // Parse respons JSON
        console.log('User Data:', result); // Debugging

        if (result.success && result.data.length > 0) {
            const userData = result.data[0]; // Ambil data user
            // Simpan data user di localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            // Tampilkan nama user di halaman
            document.getElementById('userNameDisplay').textContent = userData.nama;
        } else {
            document.getElementById('userNameDisplay').textContent = 'Guest'; // Fallback
        }
    } catch (error) {
        console.error('Error fetching user:', error.message);
        document.getElementById('userNameDisplay').textContent = 'Guest'; // Fallback jika error
    }
}

// Panggil fungsi setelah halaman selesai dimuat
document.addEventListener('DOMContentLoaded', userName);





