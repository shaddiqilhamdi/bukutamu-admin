const api2 = 'https://script.google.com/macros/s/AKfycbyzIE2e6J1KXWu-Uzs_1yx0JtmasuTXlir_8yerXn-dl13ZqEagoOxzpB2ZvB5X09zP1w/exec';
const token = localStorage.getItem('authToken'); // Ambil token dari localStorage
let editMode = false;
let editId = null;

$(document).ready(function () {
    // Cek apakah token tersedia
    if (!token) {
        Swal.fire('Error!', 'Anda harus login terlebih dahulu.', 'error');
        return;
    }

    // Inisialisasi DataTables
    const table = $('#tabelPegawai').DataTable({
        ajax: {
            url: `${api2}?type=pegawai&action=read&token=${token}`, // Gunakan api2
            dataSrc: 'data'
        },
        columns: [
            { title: "No.", data: null, render: (data, type, row, meta) => meta.row + 1 },
            { title: "Nama", data: "nama" },
            { title: "Ponsel", data: "ponsel" },
            { title: "Jabatan", data: "jabatan" },
            { title: "Bidang", data: "bidang" },
            {
                title: "Aksi",
                data: null,
                className: "text-center",
                render: (data, type, row) => `
                    <button class="btn btn-warning btn-sm edit-btn" data-id="${row.id}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${row.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                `
            }
        ],
        responsive: true,
        rowId: 'id'
    });

    // Muat dropdown bidang dan jabatan
    loadBidang();
    loadJabatan();

    // Buka form tambah atau edit
    $('a[data-bs-toggle="modal"]').on('click', function () {
        resetForm();
        $('#formPegawaiModal').modal('show');
    });

    // Simpan data pegawai
    $('#savePegawai').on('click', function (event) {
        event.preventDefault();
        showLoading();

        const dataPegawai = {
            type: 'pegawai',
            action: editMode ? 'update' : 'create',
            token: token,
            id: editId,
            nama: $('#namaLengkap').val(),
            ponsel: $('#ponsel').val(),
            bidang: $('#bidang').val(),
            jabatan: $('#jabatan').val()
        };

        $.ajax({
            url: api2, // Gunakan api2
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param(dataPegawai),
            success: function (response) {
                Swal.close();
                if (response.success) {
                    Swal.fire('Berhasil!', 'Data berhasil disimpan.', 'success');
                    $('#formPegawaiModal').modal('hide');
                    table.ajax.reload();
                    resetForm();
                } else {
                    Swal.fire('Error!', 'Gagal menyimpan data.', 'error');
                }
            },
            error: function () {
                Swal.close();
                Swal.fire('Error!', 'Terjadi kesalahan saat menyimpan data.', 'error');
            }
        });
    });

    // Edit data pegawai
    $('#tabelPegawai').on('click', '.edit-btn', function () {
        const id = $(this).data('id');
        fetchPegawaiById(id).then(pegawai => {
            if (pegawai) {
                $('#namaLengkap').val(pegawai.nama);
                $('#ponsel').val(pegawai.ponsel);
                $('#bidang').val(pegawai.bidang);
                $('#jabatan').val(pegawai.jabatan);
                $('#formPegawaiModal').modal('show');
                editMode = true;
                editId = id;
            }
        });
    });

    // Hapus data pegawai
    $('#tabelPegawai').on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: 'Data tidak bisa dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(result => {
            if (result.isConfirmed) {
                showLoading();
                $.ajax({
                    url: api2, // Gunakan api2
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    data: $.param({ type: 'pegawai', action: 'delete', token: token, id: id }),
                    success: function (response) {
                        Swal.close();
                        if (response.success) {
                            Swal.fire('Deleted!', 'Data berhasil dihapus.', 'success');
                            table.ajax.reload();
                        } else {
                            Swal.fire('Error!', 'Gagal menghapus data.', 'error');
                        }
                    },
                    error: function () {
                        Swal.close();
                        Swal.fire('Error!', 'Terjadi kesalahan saat menghapus data.', 'error');
                    }
                });
            }
        });
    });

    // Fungsi memuat dropdown bidang
    async function loadBidang() {
        try {
            const response = await fetch(`${api2}?type=bidang&token=${token}`); // Gunakan api2
            const data = await response.json();
            const dropdown = document.querySelector('#bidang');
            dropdown.innerHTML = `<option selected disabled>Pilih Bidang</option>`;
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

    // Fungsi memuat dropdown jabatan
    async function loadJabatan() {
        try {
            const response = await fetch(`${api2}?type=jabatan&token=${token}`); // Gunakan api2
            const data = await response.json();
            const dropdown = document.querySelector('#jabatan');
            dropdown.innerHTML = `<option selected disabled>Pilih Jabatan</option>`;
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

    // Fungsi mengambil data pegawai berdasarkan ID
    async function fetchPegawaiById(id) {
        try {
            const response = await fetch(`${api2}?type=pegawai&id=${id}&token=${token}`); // Gunakan api2
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching pegawai:', error.message);
            return null;
        }
    }

    // Fungsi reset form
    function resetForm() {
        $('#formPegawai')[0].reset();
        editMode = false;
        editId = null;
    }

    // Fungsi tampilkan loading
    function showLoading() {
        Swal.fire({
            title: 'Tunggu sebentar...',
            text: 'Sedang memproses data...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
});

