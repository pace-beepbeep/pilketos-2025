// Konfigurasi Firebase-mu
      const firebaseConfig = {
  apiKey: "AIzaSyDa2LihVje0_Wn7UvZDtEWlrHNDzBbZbqc",
  authDomain: "pilketosskanegu.firebaseapp.com",
  databaseURL: "https://pilketosskanegu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pilketosskanegu",
  storageBucket: "pilketosskanegu.firebasestorage.app",
  messagingSenderId: "81801718623",
  appId: "1:81801718623:web:c0edf8e8cec1d53e27e4ea",
  measurementId: "G-J1J5VMVETY"
};
      firebase.initializeApp(firebaseConfig);
// PENJAGA HALAMAN (GATEKEEPER)
// =======================================
// Cek data login dari localStorage
const voterDataJSON = localStorage.getItem('pilketosVoterData');

if (!voterDataJSON) {
    // JIKA DATA TIDAK ADA (BELUM LOGIN):
    alert('Anda harus login terlebih dahulu untuk mengakses halaman voting.');
    window.location.replace('index.html'); // .replace() agar tidak bisa klik "back"
} else {
    // Jika data ada, kita bisa lanjutkan memuat script voting.
    const voterData = JSON.parse(voterDataJSON);
    console.log(`Selamat datang, ${voterData.name}`);
}

document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const voteButtons = document.querySelectorAll('.vote-btn');

    // 1. Ambil semua elemen modal
    const modalOverlay = document.getElementById('confirmation-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    let currentCandidateId = null;
    let currentCandidateNum = null;

    // 2. Logika VOTE (saat tombol "Pilih No. X" diklik)
    voteButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentCandidateNum = button.dataset.candidate;
            currentCandidateId = `candidate_${currentCandidateNum}`;
            showConfirmationModal(currentCandidateNum);
        });
    });

    // 3. Fungsi untuk menampilkan modal
    function showConfirmationModal(candidateNum) {
        modalMessage.textContent = `Apakah Anda yakin ingin menambah suara untuk Paslon No. ${candidateNum}?`;
        modalOverlay.classList.add('show');
    }

    // 4. Fungsi untuk menyembunyikan modal
    function hideModal() {
        modalOverlay.classList.remove('show');
        currentCandidateId = null;
        currentCandidateNum = null;
    }

    // 5. Listener tombol "Batal"
    modalCancelBtn.addEventListener('click', () => {
        hideModal();
    });

    // 6. Listener tombol "Ya, Saya Yakin"
    modalConfirmBtn.addEventListener('click', () => {
        if (!currentCandidateId) {
            hideModal();
            return;
        }

        modalConfirmBtn.textContent = "Memproses...";
        modalConfirmBtn.disabled = true;
        modalCancelBtn.disabled = true;

        // ==============================================================
        // 7. (PERBAIKAN) LOGIKA FIREBASE BARU (SISTEM LOGGING)
        // ==============================================================
        
        // Kita tidak lagi menggunakan 'votes'. Kita buat lokasi data baru bernama 'vote_logs'.
        // 'vote_logs' akan menyimpan SETIAP suara yang masuk sebagai catatan terpisah.
        const logRef = database.ref('vote_logs'); 
            
        // Siapkan data yang akan disimpan. Ini menyertakan data pemilih DAN timestamp server.
        const voterInfo = JSON.parse(voterDataJSON);
        
        const voteLogData = {
            candidate: currentCandidateId, // Ini akan menyimpan "candidate_1", "candidate_2", dll.
            voter_name: voterInfo.name,
            voter_origin: voterInfo.major, // (misal: "RPL", "MAGANG", atau "GURU/STAFF")
            voter_class_or_unit: voterInfo.className,
            timestamp: firebase.database.ServerValue.TIMESTAMP // INI ADALAH TIMESTAMP SERVER (YANG ANDA BUTUHKAN)
        };

        // Push() membuat ID unik baru (seperti log) untuk setiap vote yang masuk
        logRef.push(voteLogData)
            .then(() => {
                // BERHASIL: Arahkan ke halaman 'thanks.html'
                console.log("Vote berhasil dicatat (logged).");
                window.location.href = 'q3wum432m4uTHANKS-023u409-32u4m09238mu402u.html';
            })
            .catch((error) => {
                // GAGAL: Tampilkan pesan error
                console.error("Gagal mencatat suara: ", error);
                alert("Maaf, terjadi kesalahan saat mencatat suara. Silakan coba lagi.");
                
                // Kembalikan tombol modal
                modalConfirmBtn.textContent = "Ya, Saya Yakin";
                modalConfirmBtn.disabled = false;
                modalCancelBtn.disabled = false;
                hideModal();
            });
    });

    // Opsional: Tutup modal jika user mengklik area gelap
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            hideModal();
        }
    });
});