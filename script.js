document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const voteButtons = document.querySelectorAll('.vote-btn');

    // Semua kode yang berhubungan dengan MODAL (getElementById, showModal, hideModal, dll.) kita hapus.

    // Logika VOTE
    voteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const candidateNum = button.dataset.candidate;
            const candidateId = `candidate_${candidateNum}`;
            
            if (confirm(`Anda yakin ingin menambah suara untuk Paslon No. ${candidateNum}?`)) {
                
                // Mengirimkan data suara ke Firebase
                const candidateVoteRef = database.ref(`votes/${candidateId}`);
                candidateVoteRef.transaction((currentVotes) => {
                    return (currentVotes || 0) + 1;
                });

                // LOGIKA LAMA (menampilkan modal) DIHAPUS DAN DIGANTI DENGAN PERINTAH DI BAWAH INI:

                // Langsung pindahkan (redirect) pengguna ke halaman baru
                window.location.href = 'thanks.html';
            }
        });
    });
});