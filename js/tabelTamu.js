

$(document).ready(function () {
    const table = $('#tabelTamu').DataTable({
        ajax: {
            url: `https://script.google.com/macros/s/AKfycbyzIE2e6J1KXWu-Uzs_1yx0JtmasuTXlir_8yerXn-dl13ZqEagoOxzpB2ZvB5X09zP1w/exec?type=datatamu&action=read`,
            dataSrc: 'data'
        },
        columns: [
            { 
                title: "No.", 
                data: null, 
                width: "5%", 
                render: function (data, type, row, meta) {
                    // Mengatur penomoran berdasarkan urutan di halaman saat ini
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
                render: function (data, type, row) {
                    return `${row.tanggal_keluar}<br><small>${row.jam_keluar}</small>`;
                }
            },
            {
                title: "Aksi",
                data: null,
                width: "8%",
                className: "text-center",
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-sm btn-warning btn-edit" data-id="${row.id}" data-jabatan="${row.jabatan}">
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
        order: [[4, 'desc']], // Urutkan berdasarkan kolom "Masuk" secara descending
        drawCallback: function (settings) {
            let api = this.api();
            api.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                // Sesuaikan nomor dengan urutan yang benar
                cell.innerHTML = i + 1 + settings._iDisplayStart;
            });
        }
    });
});