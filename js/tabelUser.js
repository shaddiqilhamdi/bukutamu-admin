$(document).ready(function (){
    $('#tabelUser').DataTable({
        ajax: {
            url: `https://script.google.com/macros/s/AKfycbyzIE2e6J1KXWu-Uzs_1yx0JtmasuTXlir_8yerXn-dl13ZqEagoOxzpB2ZvB5X09zP1w/exec?type=user&action=read`,
            dataSrc: 'data'
        },
        columns: [
            { title: "No.", data: null, width:"5%", render: (data, type, row, meta) => meta.row + 1 },
            { title: "Nama", data: "nama" , width:"25%" },
            { title: "Jabatan",
              data: null,
              width: "35%",
              render: function (data, type,row) {
                return `${row.jabatan} - ${row.bidang}`;
              }
            },
            { title: "Username", data: "username" , width:"15%" },
            { title: "Role", data: "role" , width:"10%" },
            { title: "Status", data: "status" },
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
        rowId: 'id'
    });
});