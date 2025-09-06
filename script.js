document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const voteButtons = document.querySelectorAll('.vote-btn');

    // 1. Ambil semua elemen modal yang kita buat di HTML
    const modalOverlay = document.getElementById('confirmation-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    // Variabel untuk menyimpan kandidat mana yang sedang akan dipilih
    let currentCandidateId = null;
    let currentCandidateNum = null;

    // 2. Logika VOTE (saat tombol "Pilih No. X" diklik)
    voteButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Ambil data kandidat dari tombol yang diklik
            currentCandidateNum = button.dataset.candidate;
            currentCandidateId = `candidate_${currentCandidateNum}`;
            
            // Alih-alih memanggil confirm(), kita panggil fungsi untuk menampilkan modal
            showConfirmationModal(currentCandidateNum);
        });
    });

    // 3. Fungsi untuk menampilkan modal
    function showConfirmationModal(candidateNum) {
        // Atur pesan di dalam modal secara dinamis
        modalMessage.textContent = `Apakah Anda yakin ingin menambah suara untuk Paslon No. ${candidateNum}?`;
        // Tampilkan modalnya (CSS di style.css akan menangani animasinya)
        modalOverlay.classList.add('show');
    }

    // 4. Fungsi untuk menyembunyikan modal
    function hideModal() {
        modalOverlay.classList.remove('show');
        // Bersihkan data kandidat setelah modal ditutup
        currentCandidateId = null;
        currentCandidateNum = null;
    }

    // 5. Tambahkan listener untuk tombol "Batal" di dalam modal
    modalCancelBtn.addEventListener('click', () => {
        hideModal();
    });

    // 6. Tambahkan listener untuk tombol "Ya, Saya Yakin" di dalam modal
    modalConfirmBtn.addEventListener('click', () => {
        // Jika tidak ada kandidat yang dipilih (seharusnya tidak terjadi, tapi untuk keamanan), hentikan proses
        if (!currentCandidateId) {
            hideModal();
            return;
        }

        // Tampilkan status loading di tombol agar user tidak klik dua kali
        modalConfirmBtn.textContent = "Memproses...";
        modalConfirmBtn.disabled = true;
        modalCancelBtn.disabled = true;

        // 7. Pindahkan Logika Firebase ke sini
        const candidateVoteRef = database.ref(`votes/${currentCandidateId}`);
        
        candidateVoteRef.transaction((currentVotes) => {
            return (currentVotes || 0) + 1;
        })
        .then(() => {
            // BERHASIL: Arahkan ke halaman 'thanks.html'
            console.log("Vote berhasil disimpan. Mengarahkan ke halaman baru...");
            window.location.href = 'thanks.html';
        })
        .catch((error) => {
            // GAGAL: Tampilkan pesan error dan kembalikan tombol ke normal
            console.error("Gagal menyimpan suara: ", error);
            alert("Maaf, terjadi kesalahan saat menyimpan suara. Silakan coba lagi.");
            
            // Kembalikan tombol modal ke keadaan semula jika gagal
            modalConfirmBtn.textContent = "Ya, Saya Yakin";
            modalConfirmBtn.disabled = false;
            modalCancelBtn.disabled = false;
            hideModal();
        });
    });

    // Opsional: Tutup modal jika user mengklik area gelap di luar kotak modal
    modalOverlay.addEventListener('click', (event) => {
        // Hanya tutup jika yang diklik adalah overlay-nya (latar belakang), bukan konten modalnya
        if (event.target === modalOverlay) {
            hideModal();
        }
    });
});
