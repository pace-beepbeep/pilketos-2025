document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi koneksi ke Firebase Realtime Database
    const database = firebase.database();
    const votesRef = database.ref('votes'); // Membuat "tabel" data bernama 'votes'

    const voteButtons = document.querySelectorAll('.vote-btn');
    const resultsOutput = document.getElementById('results-output');

    // BAGIAN YANG DIHAPUS: Pengecekan awal dan fungsi 'disableVoting' tidak diperlukan lagi
    // if (localStorage.getItem('hasVoted')) { ... }
    // function disableVoting() { ... }

    // Event listener untuk setiap tombol vote
    voteButtons.forEach(button => {
        button.addEventListener('click', () => {
            // BAGIAN YANG DIHAPUS: Pengecekan localStorage di dalam tombol juga dihapus
            // if (localStorage.getItem('hasVoted')) { ... }

            const candidateNum = button.dataset.candidate;
            const candidateId = `candidate_${candidateNum}`; // Nama field di database, misal: candidate_1

            // Konfirmasi tetap dipertahankan agar tidak salah klik
            if (confirm(`Anda yakin ingin menambah suara untuk Paslon No. ${candidateNum}?`)) {
                // Mengambil referensi suara untuk kandidat yang dipilih
                const candidateVoteRef = database.ref(`votes/${candidateId}`);
                
                // Menambah +1 suara dengan aman menggunakan 'transaction'
                candidateVoteRef.transaction((currentVotes) => {
                    return (currentVotes || 0) + 1;
                });

                // Notifikasi bahwa suara berhasil masuk
                alert('Terima kasih! Suara Anda berhasil ditambahkan.');
                
                // BAGIAN YANG DIHAPUS: Penyimpanan status ke localStorage dan menonaktifkan tombol dihapus
                // localStorage.setItem('hasVoted', 'true');
                // disableVoting();
            }
        });
    });

    // === Bagian real-time untuk menampilkan hasil (TIDAK BERUBAH) ===
    votesRef.on('value', (snapshot) => {
        const voteCounts = snapshot.val(); 

        if (!voteCounts) {
            resultsOutput.innerHTML = '<p>Belum ada suara yang masuk.</p>';
            return;
        }

        let totalVotes = 0;
        Object.values(voteCounts).forEach(count => {
            totalVotes += count;
        });

        let htmlResult = `<h3>Total Suara Masuk: ${totalVotes}</h3><div class="progress-container">`;
        
        const sortedCandidates = Object.keys(voteCounts).sort((a, b) => {
            return a.split('_')[1] - b.split('_')[1];
        });
        
        sortedCandidates.forEach(candidateKey => {
            const count = voteCounts[candidateKey];
            const candidateNum = candidateKey.split('_')[1]; 
            const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0;
            
            htmlResult += `
                <div class="result-bar">
                    <div class="result-info">
                        <strong>Kandidat No. ${candidateNum}:</strong> ${count} suara
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${percentage}%;">
                            ${percentage}%
                        </div>
                    </div>
                </div>
            `;
        });

        htmlResult += `</div>`;
        resultsOutput.innerHTML = htmlResult;
    });
});