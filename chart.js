document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    
    // UBAH REFERENSI: Kita sekarang membaca dari 'vote_logs' (lokasi data baru)
    const votesRef = database.ref('vote_logs');
    
    // Elemen HTML
    const totalVotesEl = document.getElementById('total-votes');
    const breakdownContainer = document.getElementById('breakdown-container');
    const chartCanvas = document.getElementById('myPieChart').getContext('2d');
    
    let myPieChart = null; 

    // Mendengarkan perubahan data (setiap ada log baru masuk)
    votesRef.on('value', (snapshot) => {
        
        const logs = snapshot.val(); // Ini adalah OBJEK BESAR berisi semua log vote

        // ===============================================
        // LOGIKA BARU: TALLY (MENGHITUNG ULANG) SEMUA LOG
        // ===============================================

        // Kita harus mulai hitungan dari nol setiap kali data berubah
        const voteCounts = {
            'candidate_1': 0,
            'candidate_2': 0,
            'candidate_3': 0
        };
        let totalVotes = 0;

        if (logs) {
            // Jika ada log, kita loop (iterasi) satu per satu
            for (const key in logs) {
                const logEntry = logs[key];
                const selectedCandidate = logEntry.candidate; // "candidate_1", "candidate_2", dll.

                // Tambahkan hitungan ke kandidat yang sesuai
                if (voteCounts.hasOwnProperty(selectedCandidate)) {
                    voteCounts[selectedCandidate]++;
                }
            }
            // Mengambil total suara (jumlah log yang masuk)
            totalVotes = snapshot.numChildren();
        }
        // --- Akhir Logika Baru ---


        if (totalVotes === 0) {
            totalVotesEl.textContent = 'Belum ada suara yang masuk.';
            breakdownContainer.innerHTML = '';
            return;
        }
        
        // --- 1. Persiapan Data (Bagian ini sama seperti kode lama Anda) ---
        const labels = [];
        const dataPoints = [];
        
        // Mengubah objek voteCounts (yang baru kita hitung) menjadi array agar bisa diurutkan
        const candidatesArray = Object.keys(voteCounts).map(key => {
            return { id: key.split('_')[1], votes: voteCounts[key] };
        });
        
        // Urutkan berdasarkan nomor kandidat
        candidatesArray.sort((a, b) => a.id - b.id);

        candidatesArray.forEach(candidate => {
            labels.push(`Paslon No. ${candidate.id}`);
            dataPoints.push(candidate.votes);
        });

        totalVotesEl.textContent = `Total Suara Masuk: ${totalVotes}`;

        // --- 2. Update Tampilan Progress Bar (Sama seperti kode lama Anda) ---
        let breakdownHTML = '';
        candidatesArray.forEach(candidate => {
            const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
            breakdownHTML += `
                <div class="result-bar">
                    <div class="result-info">
                        <span><strong></strong></span>
                        <span>${candidate.votes} suara</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${percentage}%;">
                            ${percentage}%
                        </div>
                    </div>
                </div>
            `;
        });
        breakdownContainer.innerHTML = breakdownHTML;

        // --- 3. Update Tampilan Pie Chart (Sama seperti kode lama Anda) ---
        const chartData = {
            labels: labels,
            datasets: [{
                data: dataPoints,
                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        if (myPieChart) {
            myPieChart.data = chartData;
            myPieChart.update();
        } else {
            myPieChart = new Chart(chartCanvas, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } } 
                }
            });
        }
    });

});
