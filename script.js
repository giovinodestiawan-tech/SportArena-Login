// Data F&B Katalog
const katalogFnb = [
    { id: 1, nama: "Air Mineral 600ml", harga: 5000 },
    { id: 2, nama: "Minuman Isotonik", harga: 10000 },
    { id: 3, nama: "Snack Keripik", harga: 12000 },
    { id: 4, nama: "Energy Bar", harga: 15000 }
];

let globalSewaData = null;
let globalFnbData = [];
let transaksiRiwayat = [];

// Fungsi Login
function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('loginError');

    if (user === 'gio' && pass === '12345') {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboardPage').classList.remove('hidden');
        document.getElementById('userDisplayName').innerText = user.toUpperCase();
        initFnbKatalog();
    } else {
        errorEl.innerText = "Username atau Password salah! (Gunakan: gio / 12345)";
    }
}

function handleLogout() {
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').innerText = "";
}

// Navigasi Tab
function switchTab(tabName) {
    document.querySelectorAll('.tab-section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.sidebar-menu li').forEach(el => el.classList.remove('active'));

    if (tabName === 'sewa') {
        document.getElementById('tabSewa').classList.remove('hidden');
        event.currentTarget?.classList.add('active');
    } else if (tabName === 'fnb') {
        document.getElementById('tabFnb').classList.remove('hidden');
    } else if (tabName === 'checkout') {
        document.getElementById('tabCheckout').classList.remove('hidden');
        hitungCheckoutSummary();
    } else if (tabName === 'riwayat') {
        document.getElementById('tabRiwayat').classList.remove('hidden');
    }
}

// Hitung Sewa Lapangan
function hitungTotalSewa() {
    const select = document.getElementById('jenisLapangan');
    const hargaLapangan = select.selectedIndex > 0 ? parseInt(select.options[select.selectedIndex].dataset.harga) : 0;
    const jumlahRaket = parseInt(document.getElementById('sewaRaket').value) || 0;
    const durasi = parseInt(document.getElementById('durasiJam').value) || 1;

    const totalRaket = jumlahRaket * 35000;
    const totalSewa = (hargaLapangan * durasi) + totalRaket;

    document.getElementById('displaySubtotalSewa').innerText = formatRupiah(totalSewa);
}

function saveSewaData(event) {
    event.preventDefault();
    const select = document.getElementById('jenisLapangan');
    const jenis = select.value;
    const hargaLapangan = parseInt(select.options[select.selectedIndex].dataset.harga);
    const raket = parseInt(document.getElementById('sewaRaket').value) || 0;
    const tanggal = document.getElementById('tanggalMain').value;
    const jam = document.getElementById('jamMain').value;
    const durasi = parseInt(document.getElementById('durasiJam').value);

    globalSewaData = {
        jenis,
        hargaLapangan,
        raket,
        totalHargaRaket: raket * 35000,
        tanggal,
        jam,
        durasi,
        totalBiayaSewa: (hargaLapangan * durasi) + (raket * 35000)
    };

    alert("Data penyewaan berhasil disimpan! Silakan lanjut ke menu Makanan & Minuman.");
    switchTab('fnb');
}

// Inisialisasi Katalog F&B
function initFnbKatalog() {
    const container = document.getElementById('fnbKatalog');
    container.innerHTML = katalogFnb.map(item => `
        <div class="fnb-item">
            <h5>${item.nama}</h5>
            <p>${formatRupiah(item.harga)}</p>
            <input type="number" min="0" value="0" data-id="${item.id}" class="fnb-qty" onchange="updateFnbData()">
        </div>
    `).join('');
}

function updateFnbData() {
    globalFnbData = [];
    document.querySelectorAll('.fnb-qty').forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const id = parseInt(input.dataset.id);
            const item = katalogFnb.find(f => f.id === id);
            globalFnbData.push({ ...item, qty, subtotal: item.harga * qty });
        }
    });
}

// Hitung Checkout Summary
function hitungCheckoutSummary() {
    const totalSewa = globalSewaData ? globalSewaData.totalBiayaSewa : 0;
    const totalFnb = globalFnbData.reduce((acc, curr) => acc + curr.subtotal, 0);
    const grandTotal = totalSewa + totalFnb;

    document.getElementById('sumSewa').innerText = formatRupiah(totalSewa);
    document.getElementById('sumFnb').innerText = formatRupiah(totalFnb);
    document.getElementById('sumGrandTotal').innerText = formatRupiah(grandTotal);
}

// Proses Pembayaran & Struk
function prosesPembayaran() {
    if (!globalSewaData) {
        alert("Harap isi data penyewaan lapangan terlebih dahulu!");
        switchTab('sewa');
        return;
    }

    const metode = document.getElementById('metodeBayar').value;
    const totalFnb = globalFnbData.reduce((acc, curr) => acc + curr.subtotal, 0);
    const grandTotal = globalSewaData.totalBiayaSewa + totalFnb;
    const transaksiId = "TRX-" + Math.floor(100000 + Math.random() * 900000);

    // Simpan ke Riwayat
    const transaksiBaru = {
        id: transaksiId,
        nama: "Gio",
        lapangan: `${globalSewaData.jenis} (${globalSewaData.durasi} Jam)`,
        detailAlatFnb: `Raket: ${globalSewaData.raket}, F&B: ${globalFnbData.map(f => f.nama + ' (' + f.qty + ')').join(', ')}`,
        total: grandTotal,
        status: "LUNAS",
        metode
    };

    transaksiRiwayat.push(transaksiBaru);
    renderRiwayatTable();

    // Tampilkan Struk
    document.getElementById('strukId').innerText = `ID Transaksi: ${transaksiId}`;
    document.getElementById('strukContent').innerHTML = `
        <p><strong>Nama Pemesan:</strong> Gio</p>
        <p><strong>Tanggal/Jam:</strong> ${globalSewaData.tanggal} ${globalSewaData.jam}</p>
        <p><strong>Lapangan:</strong> ${globalSewaData.jenis} (${globalSewaData.durasi} Jam)</p>
        <p><strong>Sewa Raket:</strong> ${globalSewaData.raket} unit</p>
        <p><strong>Makanan/Minuman:</strong> ${globalFnbData.map(f => `${f.nama} x${f.qty}`).join(', ') || '-'}</p>
        <hr style="margin: 10px 0; border-style: dashed;">
        <p><strong>Metode Bayar:</strong> ${metode}</p>
        <p><strong>Total Bayar:</strong> ${formatRupiah(grandTotal)}</p>
    `;
    document.getElementById('strukArea').classList.remove('hidden');
    alert("Pembayaran Berhasil Diverifikasi (LUNAS)!");
}

// Render Tabel Riwayat
function renderRiwayatTable() {
    const tbody = document.querySelector('#tabelRiwayat tbody');
    if (transaksiRiwayat.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Belum ada riwayat transaksi.</td></tr>`;
        return;
    }

    tbody.innerHTML = transaksiRiwayat.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${t.nama}</td>
            <td>${t.lapangan}</td>
            <td>${t.detailAlatFnb}</td>
            <td>${formatRupiah(t.total)}</td>
            <td><span class="badge-lunas">${t.status}</span></td>
        </tr>
    `).join('');
}

// Export ke Excel
function exportToExcel() {
    if (transaksiRiwayat.length === 0) {
        alert("Tidak ada data riwayat untuk diexport!");
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(transaksiRiwayat);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Pemesanan");
    XLSX.writeFile(workbook, "Riwayat_Penyewaan_SportArena.xlsx");
}

// Utility Format Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
}