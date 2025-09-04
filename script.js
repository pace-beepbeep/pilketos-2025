document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const voteButtons = document.querySelectorAll('.vote-btn');

    // Logika VOTE
    voteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const candidateNum = button.dataset.candidate;
            const candidateId = `candidate_${candidateNum}`;
            
            if (confirm(`Anda yakin ingin menambah suara untuk Paslon No. ${candidateNum}?`)) {
                
                const candidateVoteRef = database.ref(`votes/${candidateId}`);
                
                // Mengirimkan data suara ke Firebase
                candidateVoteRef.transaction((currentVotes) => {
                    return (currentVotes || 0) + 1;
                })
                .then(() => {
                    // BAGIAN INI HANYA AKAN DIJALANKAN SETELAH DATA 100% BERHASIL DISIMPAN
                    console.log("Vote berhasil disimpan. Mengarahkan ke halaman baru...");
                    window.location.href = 'thanks.html'; // Pindahkan nama file 'thanks.html' menjadi 'terimakasih.html' jika itu yang Anda gunakan
                })
                .catch((error) => {
                    // Bagian ini akan berjalan jika ada error
                    console.error("Gagal menyimpan suara: ", error);
                    alert("Maaf, terjadi kesalahan saat menyimpan suara. Silakan coba lagi.");
                });
            }
        });
    });
});
