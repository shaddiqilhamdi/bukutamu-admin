$(document).ready(function () {
    const table = $('#tabelUserLog').DataTable({
        ajax: {
            url: 'https://script.google.com/macros/s/AKfycbyzIE2e6J1KXWu-Uzs_1yx0JtmasuTXlir_8yerXn-dl13ZqEagoOxzpB2ZvB5X09zP1w/exec?type=userlog&action=read',
            dataSrc: function (json) {
                // Periksa respon untuk kesalahan
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
            { 
                title: "No.", 
                data: null, 
                width: "5%", 
                render: function (data, type, row, meta) {
                    return meta.row + 1 + meta.settings._iDisplayStart;
                }
            },
            { title: "ID", data: "id", width: "20%" },
            { title: "Timestamp", data: "timestamp", width: "25%" },
            { title: "Username", data: "username", width: "15%" },
            { title: "Aktivitas", data: "aktivitas" }
        ],
        responsive: true,
        rowId: 'id',
        dom: 'Bfrtip',  // Posisi tombol
        order: [[2, 'desc']],  // Urutkan berdasarkan timestamp terbaru
        pageLength: 20, // Jumlah entri per halaman
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<i class="bi bi-file-earmark-excel"></i> Export Excel',
                className: 'btn btn-success btn-sm',
                exportOptions: {
                    columns: ':visible' // Export hanya kolom yang terlihat
                }
            },
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Print',
                className: 'btn btn-info btn-sm'
            }
        ],
        drawCallback: function (settings) {
            let api = this.api();
            api.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1 + settings._iDisplayStart;
            });
        }
    });

    // Tempatkan tombol di atas tabel
    table.buttons().container().appendTo('#tabelUserLog_wrapper .col-md-6:eq(0)');
});
