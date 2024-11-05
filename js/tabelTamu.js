const token = localStorage.getItem('authToken');
console.log('Auth Token:', token);

async function loadTujuan() {
    try {
        const response = await fetch(`${scriptURL}?type=pegawai&token=${token}`);
        const data = await response.json();
        const dropdown = document.querySelector('#tujuan');
        dropdown.innerHTML = `<option selected disabled>- Pilih Tujuan Kunjungan -</option>`;
        data.data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.fetch_tujuan;
            option.textContent = item.fetch_tujuan;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching tujuan:', error.message);
    }
}

$(document).ready(function () {
    const table = $('#tabelTamu').DataTable({
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
                        <button class="btn btn-sm btn-warning btn-edit" data-id="${row.id}">
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
    loadTujuan();

    // Tombol untuk membuka modal dan menambah data baru
    $('a[data-bs-target="#formTamu"]').on('click', function () {
        $('#formTamu').attr('data-mode', 'create'); // Set mode ke "create"
        $('#formTamu')[0].reset(); // Reset form
        $('#formModal').modal('show'); // Tampilkan modal
    });


    // Tombol untuk membuka modal dan mengedit data
    $('#tabelTamu').on('click', '.btn-edit', function () {
        const id = $(this).data('id');
        const rowData = table.row($(this).parents('tr')).data();

        // Isi form dengan data dari rowData
        $('#formTamu input[name="nama"]').val(rowData.nama);
        $('#formTamu input[name="ponsel"]').val(rowData.ponsel);
        $('#formTamu input[name="instansi"]').val(rowData.instansi);
        $('#formTamu input[name="alamat"]').val(rowData.alamat);
        $('#formTamu input[name="tujuan"]').val(rowData.tujuan);
        $('#formTamu textarea[name="keperluan"]').val(rowData.keperluan);
        $('#formTamu input[name="id"]').val(id);

        $('#formTamu').attr('data-mode', 'edit'); // Set mode ke "edit"
        $('#formModal').modal('show'); // Tampilkan modal
    });

    // Form submit untuk create dan update
    document.getElementById('formTamu').addEventListener('submit', function (e) {
        e.preventDefault();
        const mode = this.getAttribute('data-mode'); // Ambil mode (create atau edit)
        if (!mode) {
            console.error('Form mode is not set!'); // Debugging jika mode null
            return;
        }
        const formData = $(this).serialize();
        const action = mode === 'edit' ? 'update' : 'create';

        console.log('Form mode:', mode); // Debugging
        showLoading();
        $.ajax({
            url: `${scriptURL}?type=datatamu&action=${action}&token=${token}`,
            method: 'POST',
            data: formData,
            success: function (response) {
                Swal.close();
                if (response.success) {
                    Swal.fire('Success!', 'Data berhasil disimpan.', 'success');
                    $('#formModal').modal('hide');
                    table.ajax.reload();
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

