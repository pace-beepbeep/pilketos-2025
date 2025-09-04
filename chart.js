document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const votesRef = database.ref('votes');
    
    // Elemen HTML yang akan kita manipulasi
    const totalVotesEl = document.getElementById('total-votes');
    const breakdownContainer = document.getElementById('breakdown-container');
    const chartCanvas = document.getElementById('myPieChart').getContext('2d');
    
    let myPieChart = null; // Variabel untuk menyimpan instance chart

    // Mendengarkan perubahan data di Firebase
    votesRef.on('value', (snapshot) => {
        const voteCounts = snapshot.val();

        if (!voteCounts) {
            totalVotesEl.textContent = 'Belum ada suara yang masuk.';
            breakdownContainer.innerHTML = '';
            return;
        }

        // --- 1. Persiapan Data ---
        const labels = [];
        const dataPoints = [];
        let totalVotes = 0;
        
        // Mengubah objek voteCounts menjadi array agar bisa diurutkan
        const candidatesArray = Object.keys(voteCounts).map(key => {
            return { id: key.split('_')[1], votes: voteCounts[key] };
        });
        // Urutkan berdasarkan nomor kandidat
        candidatesArray.sort((a, b) => a.id - b.id);

        candidatesArray.forEach(candidate => {
            labels.push(`Paslon No. ${candidate.id}`);
            dataPoints.push(candidate.votes);
            totalVotes += candidate.votes;
        });

        totalVotesEl.textContent = `Total Suara Masuk: ${totalVotes}`;

        // --- 2. Update Tampilan Progress Bar ---
        let breakdownHTML = '';
        candidatesArray.forEach(candidate => {
            const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
            breakdownHTML += `
                <div class="result-bar">
                    <div class="result-info">
                        <span><strong>Paslon No. ${candidate.id}</strong></span>
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

        // --- 3. Update Tampilan Pie Chart ---
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
            // Jika chart sudah ada, update datanya
            myPieChart.data = chartData;
            myPieChart.update();
        } else {
            // Jika belum, buat chart baru
            myPieChart = new Chart(chartCanvas, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } } // Sembunyikan legenda default
                }
            });
        }
    });
});