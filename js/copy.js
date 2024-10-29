const apiUrl = 'https://script.google.com/macros/s/AKfycbwUMPhelYSDjD-gVUgrQQ6zhGLeLFy2Tw7U9WcIogzMuh76q9TRTV3Xf5EVQM289ANP/exec';
const token = localStorage.getItem('authToken');

$(document).ready(function () {
    const table = initDataTable();
    handleFormSubmit(table);
    handleEdit(table);
    handleDelete(table);
    loadDropdowns();  // Panggil dropdown jabatan dan bidang

    // Cek apakah form ditemukan saat halaman siap
    resetForm();  
});


// Inisialisasi DataTable
function initDataTable() {
    return $('#tabelPegawai').DataTable({
        ajax: {
            url: `${apiUrl}?type=pegawai&action=read&token=${token}`,
            dataSrc: function (json) {
                if (!json.success) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Memuat Data',
                        text: json.message || 'Terjadi kesalahan pada server.',
                    });
                    return [];
                }
                return json.data;
            }
        },
        columns: [
            { title: "No.", data: null, render: (data, type, row, meta) => meta.row + 1 },
            { title: "Nama", data: "nama" },
            { title: "Jabatan", data: "jabatan" },
            { title: "Bidang", data: "bidang" },
            {
                title: "Aksi",
                data: null,
                className: "text-center",
                render: (data, type, row) => `
                    <button class="btn btn-warning btn-sm btn-edit" data-id="${row.id}">
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${row.id}">
                        <i class="bi bi-trash"></i> Hapus
                    </button>`
            }
        ],
        responsive: true,
        rowId: 'id'
    });
}

// Fungsi untuk menangani pengisian dropdown jabatan dan bidang
function loadDropdowns() {
    loadJabatan();
    loadBidang();
}

function loadJabatan() {
    fetch(`${apiUrl}?type=jabatan&action=read&token=${token}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const jabatanSelect = document.getElementById('jabatan');
                jabatanSelect.innerHTML = '<option value="">- Pilih Jabatan -</option>';
                result.data.forEach(jabatan => {
                    const option = document.createElement('option');
                    option.value = jabatan.jabatan;
                    option.textContent = jabatan.jabatan;
                    jabatanSelect.appendChild(option);
                });
            } else {
                console.error('Gagal memuat jabatan:', result.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

function loadBidang() {
    fetch(`${apiUrl}?type=bidang&action=read&token=${token}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const bidangSelect = document.getElementById('bidang');
                bidangSelect.innerHTML = '<option value="">- Pilih Bidang -</option>';
                result.data.forEach(bidang => {
                    const option = document.createElement('option');
                    option.value = bidang.bidang;
                    option.textContent = bidang.bidang;
                    bidangSelect.appendChild(option);
                });
            } else {
                console.error('Gagal memuat bidang:', result.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

function resetForm() {
    const form = document.getElementById('formPegawai');
    if (form && form.tagName === 'FORM') {
        console.log('Form ditemukan dan siap di-reset.');
        form.reset();  // Reset input form
        $('#pegawaiId').val('');  // Kosongkan input hidden ID
    } else {
        console.error('Form tidak ditemukan atau bukan elemen <form>.');
        console.log('Elemen ditemukan:', form);  // Debug untuk cek elemen
    }
}



// Menangani submit form pegawai
function handleFormSubmit(table) {
    $('#formPegawai').on('submit', function (e) {
        e.preventDefault();

        const id = $('#pegawaiId').val();
        const action = id ? 'update' : 'create';

        const data = new URLSearchParams({
            type: 'pegawai',
            action: action,
            token: token,
            id: id,
            nama: $('#nama').val().trim(),
            jabatan: $('#jabatan').val(),
            bidang: $('#bidang').val()
        });

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                Swal.fire('Berhasil', 'Data berhasil disimpan.', 'success');
                $('#modalPegawai').modal('hide');
                resetForm();  // Panggil resetForm di sini
                table.ajax.reload();  // Reload data table
            } else {
                Swal.fire('Gagal', result.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Kesalahan', 'Terjadi kesalahan saat menyimpan data.', 'error');
        });
    });
}


// Menangani aksi edit pegawai
function handleEdit(table) {
    $('#tabelPegawai').on('click', '.btn-edit', function () {
        const id = $(this).data('id');

        fetch(`${apiUrl}?type=pegawai&action=read&id=${id}&token=${token}`)
            .then(response => response.json())
            .then(result => {
                if (result.success && result.data.length > 0) {
                    const pegawai = result.data[0];
                    $('#pegawaiId').val(pegawai.id);
                    $('#nama').val(pegawai.nama);
                    $('#jabatan').val(pegawai.jabatan);
                    $('#bidang').val(pegawai.bidang);
                    $('#modalPegawai').modal('show');
                } else {
                    Swal.fire('Gagal', 'Data tidak ditemukan.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Kesalahan', 'Terjadi kesalahan saat mengambil data.', 'error');
            });
    });
}

// Menangani aksi delete pegawai
function handleDelete(table) {
    $('#tabelPegawai').on('click', '.btn-delete', function () {
        const id = $(this).data('id');

        Swal.fire({
            title: 'Anda yakin?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                const data = new URLSearchParams({
                    type: 'pegawai',
                    action: 'delete',
                    token: token,
                    id: id
                });

                fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: data
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        Swal.fire('Berhasil', 'Data berhasil dihapus.', 'success');
                        table.ajax.reload();
                    } else {
                        Swal.fire('Gagal', result.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire('Kesalahan', 'Terjadi kesalahan saat menghapus data.', 'error');
                });
            }
        });
    });
}