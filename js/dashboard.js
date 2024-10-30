const scriptURLPublik = 'https://script.google.com/macros/s/AKfycbyzIE2e6J1KXWu-Uzs_1yx0JtmasuTXlir_8yerXn-dl13ZqEagoOxzpB2ZvB5X09zP1w/exec';

window.onload = fetchSummaryData;

document.addEventListener('DOMContentLoaded', () => {
    const totalTamuBulanIniElem = document.getElementById('totalTamuBulanIni');
    const rataRataPerHariElem = document.getElementById('rataRataPerHari');
    const tamuHariIniElem = document.getElementById('tamuHariIni');

    if (totalTamuBulanIniElem || rataRataPerHariElem || tamuHariIniElem) {
        fetchSummaryData();
    }
});

// Fungsi menghitung persentase perubahan dan mengubah warna teks
function calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? '∞%' : '0%'; // Hindari pembagian dengan 0
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(0); // Batasi 2 angka desimal
}

// Fungsi untuk memperbarui elemen dengan nilai dan warna dinamis
function updateElementWithColor(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = `${value}%`; // Tampilkan nilai dengan simbol persen

        // Tentukan warna berdasarkan nilai
        if (parseFloat(value) > 0) {
            element.style.color = 'green'; // Hijau untuk nilai positif
        } else if (parseFloat(value) < 0) {
            element.style.color = 'red'; // Merah untuk nilai negatif
        } else {
            element.style.color = 'black'; // Hitam untuk nol
        }
    }
}

async function fetchSummaryData() {
    try {
        const response = await fetch(`${scriptURLPublik}?type=summary`);
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

        const data = await response.json();
        console.log('Summary Data:', data);

        if (data.success) {
            const message = data.message;

            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.innerText = value ?? '0';
                }
            };

            // Perbarui data utama
            updateElement('totalTamuBulanIni', message.totalTamuBulanIni);
            updateElement('rataRataPerHari', message.rataRataPerhari);
            updateElement('tamuHariIni', message.tamuHariIni);
            updateElement('totalTamuAktif', message.tamuAktifHariIni);

            // Hitung dan tampilkan persentase kenaikan/penurunan dengan warna dinamis
            const persentaseBulan = calculatePercentageChange(
                message.totalTamuBulanIni,
                message.totalTamuBulanLalu
            );
            const persentaseRataRataPerHari = calculatePercentageChange(
                message.rataRataPerhari,
                message.rataRataPerhariBulanLalu
            );
            const persentaseHariIni = calculatePercentageChange(
                message.tamuHariIni,
                message.tamuHariLalu
            );

            // Update elemen dengan warna dinamis
            updateElementWithColor('persentaseBulan', persentaseBulan);
            updateElementWithColor('persentaseRataRata', persentaseRataRataPerHari);
            updateElementWithColor('persentaseHari', persentaseHariIni);

            // Render chart jika data tersedia
            if (message.chartData) {
                const labels = message.chartData.map(entry => {
                    const date = new Date(entry.date);
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${day}`; // Format hari
                });

                const dataSet = message.chartData.map(entry => entry.value);
                renderLineChart(labels, dataSet);
            } else {
                console.warn('Tidak ada data chart yang tersedia');
            }
        } else {
            console.error('Error fetching summary data:', data.message);
        }
    } catch (error) {
        console.error('Error fetching summary data:', error.message);
    }
}

// Pindahkan fungsi renderLineChart ke sini agar dapat diakses dari mana saja
function renderLineChart(labels, dataSet) {
    const ctx = document.getElementById('chartKunjunganBulanan').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 225);
    gradient.addColorStop(0, "rgba(215, 227, 244, 1)");
    gradient.addColorStop(1, "rgba(215, 227, 244, 0)");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels, // Labels dalam format MMDD
            datasets: [{
                label: "Total Tamu per Hari",
                fill: true,
                backgroundColor: gradient,
                borderColor: window.theme?.primary || 'rgba(75, 192, 192, 1)',
                data: dataSet,
                tension: 0.4
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            tooltips: {
                intersect: false
            },
            hover: {
                intersect: true
            },
            plugins: {
                filler: {
                    propagate: false
                }
            },
            scales: {
                xAxes: [{
                    reverse: false,
                    gridLines: {
                        color: "rgba(0,0,0,0.0)"
                    }
                }],
                yAxes: [{
                    ticks: {
                        stepSize: 10,
                        beginAtZero: true
                    },
                    display: true,
                    borderDash: [3, 3],
                    gridLines: {
                        color: "rgba(0,0,0,0.0)"
                    }
                }]
            }
        }
    });
}
