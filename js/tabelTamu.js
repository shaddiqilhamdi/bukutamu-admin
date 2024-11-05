const token = localStorage.getItem('authToken');
console.log('Auth Token:', token);
let table;

$(document).ready(function () {
    table = $('#tabelTamu').DataTable({
        ajax: {
            url: `${scriptURL}?type=datatamu&token=${token}`,
            dataSrc: 'data'
        },
        columns: [
            { 
                title: "No.", 
                data: null, 
                width: "5%", 
                render: function (data, type, row, meta) {
                    return meta.row + 1 + meta.settings._iDisplayStart;
                }
            },
            { 
                title: "Nama Tamu", 
                data: null, 
                width: "17%", 
                render: function (data, type, row) {
                    return `${row.nama}<br><small>${row.ponsel}</small>`;
                }
            },
            { 
                title: "Instansi", 
                data: null, 
                width: "25%", 
                render: function (data, type, row) {
                    return `${row.instansi}<br><small>${row.alamat}</small>`;
                }
            },
            { 
                title: "Tujuan", 
                data: null, 
                width: "25%", 
                render: function (data, type, row) {
                    return `${row.tujuan}<br><small>${row.keperluan}</small>`;
                }
            },
            { 
                title: "Masuk", 
                data: null, 
                width: "10%", 
                render: function (data, type, row) {
                    return `${row.tanggal_masuk}<br><small>${row.jam_masuk}</small>`;
                }
            },
            {
                title: "Keluar",
                data: null,
                width: "10%",
                className: "text-center",
                render: function (data, type, row) {
                    if (!row.tanggal_keluar && !row.jam_keluar) {
                        return `
                            <button class="btn btn-sm btn-success btn-keluar mt-1" data-id="${row.id}">
                                <i class="bi bi-box-arrow-right"></i></button>`;
                    } else {
                        return `${row.tanggal_keluar || '-'}<br><small>${row.jam_keluar || '-'}</small>`;
                    }
                }
            },
            {
                title: "Aksi",
                data: null,
                width: "8%",
                className: "text-center",
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-sm btn-warning btn-edit" 
                                data-id="${row.id}"
                                data-nama="${row.nama}" 
                                data-ponsel="${row.ponsel}" 
                                data-instansi="${row.instansi}" 
                                data-alamat="${row.alamat}"
                                data-tujuan="${row.tujuan}"
                                data-bidang="${row.bidang}"
                                data-keperluan="${row.keperluan}">
                            <i class="bi bi-pencil-square"></i>
                        </button>

                        <button class="btn btn-sm btn-danger btn-delete" data-id="${row.id}">
                            <i class="bi bi-trash"></i>
                        </button>`;
                }
            }
        ],
        responsive: true,
        rowId: 'id',
        order: [[4, 'desc']],
        drawCallback: function (settings) {
            let api = this.api();
            api.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1 + settings._iDisplayStart;
            });
        }
    });
    loadBidang();
});

// Fungsi untuk memuat data bidang
async function loadBidang() {
    try {
        const response = await fetch(`${scriptURL}?type=bidang&token=${token}`);
        const data = await response.json();
        const dropdown = document.querySelector('#bidang');
        dropdown.innerHTML = `<option selected disabled>- Pilih Bidang Kunjungan-</option>`;
        data.data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.bidang;
            option.textContent = item.bidang;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching bidang:', error.message);
    }
}

// Event listener untuk tombol "Tambah"
document.querySelector('[data-bs-target="#formTamu"]').addEventListener('click', function () {
    document.getElementById('formTamu').setAttribute('data-mode', 'create');
    document.getElementById('formTamu').removeAttribute('data-id');
    const form = document.getElementById('formTamu');
    if (form) {
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.value = '';
        });
    }
});

// Event listener untuk tombol "Edit"
$('#tabelTamu').on('click', '.btn-edit', function () {
    const id = $(this).data('id');
    const nama = $(this).data('nama');
    const ponsel = $(this).data('ponsel');
    const instansi = $(this).data('instansi');
    const alamat = $(this).data('alamat');
    const tujuan = $(this).data('tujuan');
    const bidang = $(this).data('bidang');
    const keperluan = $(this).data('keperluan');
    
    // Isi form dengan data yang dipilih
    document.getElementById('nama').value = nama;
    document.getElementById('ponsel').value = ponsel;
    document.getElementById('instansi').value = instansi;
    document.getElementById('alamat').value = alamat;
    document.getElementById('tujuan').value = tujuan;
    document.getElementById('bidang').value = bidang;
    document.getElementById('keperluan').value = keperluan;
    document.getElementById('formTamu').setAttribute('data-mode', 'edit');
    document.getElementById('formTamu').setAttribute('data-id', id);
    
    $('#formTamu').modal('show');
});

// Event listener untuk tombol "Delete"
$('#tabelTamu').on('click', '.btn-delete', function () {
    const id = $(this).data('id');

    Swal.fire({
        title: 'Yakin ingin menghapus?',
        text: 'Data ini tidak bisa dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            showLoading();

            const data = new URLSearchParams({
                type: 'datatamu',
                action: 'delete',
                id: id,
                token: token
            });

            try {
                const response = await fetch(scriptURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: data.toString()
                });

                const textResult = await response.text();
                let result;

                try {
                    result = JSON.parse(textResult);
                } catch (err) {
                    Swal.close();
                    console.error('Invalid JSON response:', textResult);
                    Swal.fire('Error!', 'Respons dari server tidak valid.', 'error');
                    return;
                }

                if (response.ok && result.success) {
                    Swal.fire('Deleted!', 'Data berhasil dihapus.', 'success');
                    table.ajax.reload(); // Reload data di tabel
                } else {
                    throw new Error(result.message || "Gagal menghapus data");
                }
            } catch (error) {
                Swal.close();
                console.error('Error deleting data:', error.message);
                Swal.fire('Error!', 'Terjadi kesalahan saat menghapus data: ' + error.message, 'error');
            }
        }
    });
});

// Form submit handler
document.getElementById("formTamu").addEventListener('submit', async function (e) {
    e.preventDefault();
    
    // Ambil nilai dari form input
    const nama = document.getElementById('nama').value;
    const ponsel = document.getElementById('ponsel').value;
    const instansi = document.getElementById('instansi').value;
    const alamat = document.getElementById('alamat').value;
    const tujuan = document.getElementById('tujuan').value;
    const bidang = document.getElementById('bidang').value;
    const now = new Date();
    const tanggal_masuk = formatLocalDate(now);
    const jam_masuk = formatLocalTime(now);

    const keperluan = document.getElementById('keperluan').value;
    const mode = this.getAttribute('data-mode');
    const id = this.getAttribute('data-id');
    const action = mode === 'edit' ? 'update' : 'create';

    // Validasi jika field wajib diisi
    if (!nama || !ponsel || !instansi || !alamat || !tujuan || !bidang || !keperluan) {
        Swal.fire('Error!', 'Semua field wajib diisi!', 'error');
        return;
    }

    showLoading();

    // Siapkan data untuk dikirim
    const data = new URLSearchParams({ 
        type: 'datatamu', // Pastikan 'type' sesuai dengan yang diharapkan oleh backend Anda
        action: action,
        nama: nama,
        ponsel: ponsel,
        instansi: instansi, 
        alamat: alamat,
        tujuan: tujuan,
        bidang: bidang,
        keperluan: keperluan,
        tanggal_masuk: tanggal_masuk,
        jam_masuk: jam_masuk,
        token: token 
    });
    
    if (mode === 'edit') data.append('id', id);

    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data.toString()
        });

        const result = await response.json();
        if (response.ok && result.success) {
            Swal.fire('Success!', result.message, 'success');
            $('#formTamu').modal('hide');
            table.ajax.reload(); // Reload data di tabel
        } else {
            throw new Error(result.message || "Gagal memproses permintaan");
        }
    } catch (error) {
        Swal.fire('Error!', 'Terjadi kesalahan saat mengirim data: ' + error.message, 'error');
    }
});


// Fungsi untuk menampilkan loading
function showLoading() {
    Swal.fire({
        title: 'Mohon tunggu...',
        html: 'Sedang memproses permintaan Anda',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

// 'YYYY-MM-DD HH:MM:SS'
function formatLocalDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tambahkan leading zero jika perlu
    const day = String(date.getDate()).padStart(2, '0'); // Tambahkan leading zero jika perlu
    const hours = String(date.getHours()).padStart(2, '0'); // Tambahkan leading zero jika perlu
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Tambahkan leading zero jika perlu
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Tambahkan leading zero jika perlu
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 'YYYY-MM-DD'
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 'HH:MM:SS'
function formatLocalTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
