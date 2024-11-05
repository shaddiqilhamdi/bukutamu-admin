const token = localStorage.getItem('authToken');
let table;

$(document).ready(function () {
    // Inisialisasi DataTable
    table = $('#tabelPegawai').DataTable({
        ajax: {
            url: `${scriptURL}?type=pegawai&token=${token}`,
            dataSrc: 'data'
        },
        columns: [
            { title: "No.", data: null, width: "5%", render: (data, type, row, meta) => meta.row + 1 },
            { 
                title: "Nama", 
                data: null, 
                width: "30%", 
                render: function (data, type, row) {
                    return `${row.nama}<br><small>${row.ponsel}</small>`;
                }
            },

            { 
                title: "Jabatan", 
                data: null, 
                width: "30%", 
                render: function (data, type, row) {
                    return `${row.jabatan}<br><small>${row.bidang}</small>`;
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
                            data-jabatan="${row.jabatan}" 
                            data-bidang="${row.bidang}">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${row.id}">
                            <i class="bi bi-trash"></i>
                        </button>`;
                }
            }
        ],
        responsive: true,
        rowId: 'id'
    });
    loadBidang();
    loadJabatan();
});

// Event listener untuk tombol "Tambah"
document.querySelector('[data-bs-target="#formPegawai"]').addEventListener('click', function () {
    document.getElementById('formPegawai').setAttribute('data-mode', 'create');
    document.getElementById('formPegawai').removeAttribute('data-id');
    const form = document.getElementById('formPegawai');
    if (form) {
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.value = '';
        });
    }
});

// Event listener untuk tombol "Edit"
$('#tabelPegawai').on('click', '.btn-edit', function () {
    const id = $(this).data('id');
    const nama = $(this).data('nama');
    const ponsel = $(this).data('ponsel');
    const jabatan = $(this).data('jabatan');
    const bidang = $(this).data('bidang');
    
    // Isi form dengan data yang dipilih
    document.getElementById('nama').value = nama;
    document.getElementById('ponsel').value = ponsel;
    document.getElementById('jabatan').value = jabatan;
    document.getElementById('bidang').value = bidang;
    document.getElementById('formPegawai').setAttribute('data-mode', 'edit');
    document.getElementById('formPegawai').setAttribute('data-id', id);
    
    $('#formPegawai').modal('show');
});

// Event listener untuk tombol "Delete"
$('#tabelPegawai').on('click', '.btn-delete', function () {
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
                type: 'pegawai',
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
document.getElementById("formPegawai").addEventListener('submit', async function (e) {
    e.preventDefault();
    
    // Ambil nilai dari form input
    const nama = document.getElementById('nama').value;
    const ponsel = document.getElementById('ponsel').value;
    const jabatan = document.getElementById('jabatan').value;
    const bidang = document.getElementById('bidang').value;
    const mode = this.getAttribute('data-mode');
    const id = this.getAttribute('data-id');
    const action = mode === 'edit' ? 'update' : 'create';

    // Validasi jika field wajib diisi
    if (!nama || !ponsel || !jabatan || !bidang) {
        Swal.fire('Error!', 'Semua field wajib diisi!', 'error');
        return;
    }

    showLoading();

    // Siapkan data untuk dikirim
    const data = new URLSearchParams({ 
        type: 'pegawai', // Pastikan 'type' sesuai dengan yang diharapkan oleh backend Anda
        action: action,
        nama: nama,
        ponsel: ponsel,
        jabatan: jabatan, 
        bidang: bidang, 
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
            $('#formPegawai').modal('hide');
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

// Fungsi untuk memuat data bidang
async function loadBidang() {
    try {
        const response = await fetch(`${scriptURL}?type=bidang&token=${token}`);
        const data = await response.json();
        const dropdown = document.querySelector('#bidang');
        dropdown.innerHTML = `<option selected disabled>- Pilih Bidang -</option>`;
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

// Fungsi untuk memuat data jabatan
async function loadJabatan() {
    try {
        const response = await fetch(`${scriptURL}?type=jabatan&token=${token}`);
        const data = await response.json();
        const dropdown = document.querySelector('#jabatan');
        dropdown.innerHTML = `<option selected disabled>- Pilih Jabatan -</option>`;
        data.data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.jabatan;
            option.textContent = item.jabatan;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching jabatan:', error.message);
    }
}
