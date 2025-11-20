function hitungCIDR() {
    // 1. Ambil input
    const input = document.getElementById('cidrInput').value.trim();
    const hasilDiv = document.getElementById('hasil');
    hasilDiv.innerHTML = ''; // Bersihkan hasil sebelumnya

    if (!input.includes('/')) {
        hasilDiv.innerHTML = '<p style="color: red;">Format input salah. Gunakan format IP/CIDR (misalnya: 192.168.1.0/24).</p>';
        return;
    }

    const parts = input.split('/');
    const ipAddress = parts[0];
    const prefixLength = parseInt(parts[1], 10);

    if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 32) {
        hasilDiv.innerHTML = '<p style="color: red;">Panjang prefiks CIDR harus antara 0 hingga 32.</p>';
        return;
    }

    const ipOctets = ipAddress.split('.').map(Number);
    if (ipOctets.length !== 4 || ipOctets.some(octet => isNaN(octet) || octet < 0 || octet > 255)) {
         hasilDiv.innerHTML = '<p style="color: red;">Alamat IP tidak valid.</p>';
         return;
    }


    // 2. Hitung Subnet Mask
    let maskOctets = [];
    for (let i = 0; i < 4; i++) {
        let octetMask = 0;
        for (let j = 0; j < 8; j++) {
            const currentBit = (i * 8) + j + 1;
            if (currentBit <= prefixLength) {
                octetMask += Math.pow(2, 7 - j);
            }
        }
        maskOctets.push(octetMask);
    }
    const subnetMask = maskOctets.join('.');

    // 3. Hitung Jumlah Host
    const hostBits = 32 - prefixLength;
    const totalAddresses = Math.pow(2, hostBits);
    const usableHosts = totalAddresses >= 2 ? totalAddresses - 2 : totalAddresses;

    // 4. Hitung Network Address (Alamat Jaringan)
    let networkOctets = [];
    for (let i = 0; i < 4; i++) {
        // Bitwise AND antara IP dan Mask
        networkOctets.push(ipOctets[i] & maskOctets[i]);
    }
    const networkAddress = networkOctets.join('.');

    // 5. Hitung Broadcast Address (Alamat Broadcast)
    let broadcastOctets = [];
    // Wildcard mask adalah kebalikan dari subnet mask (255.255.255.255 - Subnet Mask)
    const wildcardOctets = maskOctets.map(mask => 255 - mask); 
    
    for (let i = 0; i < 4; i++) {
        // Bitwise OR antara Network Address dan Wildcard Mask
        broadcastOctets.push(networkOctets[i] | wildcardOctets[i]);
    }
    const broadcastAddress = broadcastOctets.join('.');
    
    // 6. Hitung Rentang Host (Alamat yang Dapat Digunakan)
    let firstHostOctets = networkOctets.slice();
    let lastHostOctets = broadcastOctets.slice();
    
    // Alamat Host Pertama: Network Address + 1 di oktet terakhir (jika bukan /31 atau /32)
    let firstHost = '';
    let lastHost = '';

    if (usableHosts > 0) {
        firstHostOctets[3] += 1;
        firstHost = firstHostOctets.join('.');
        
        // Alamat Host Terakhir: Broadcast Address - 1 di oktet terakhir
        lastHostOctets[3] -= 1;
        lastHost = lastHostOctets.join('.');
    } else {
        // Untuk /31 dan /32, tidak ada host yang dapat digunakan
        firstHost = networkAddress;
        lastHost = networkAddress;
    }


    // 7. Tampilkan Hasil
    hasilDiv.innerHTML = `
        <h2>Hasil Perhitungan</h2>
        <p><strong>Alamat IP/CIDR:</strong> ${ipAddress}/${prefixLength}</p>
        <p><strong>Panjang Prefiks:</strong> /${prefixLength}</p>
        <p><strong>Subnet Mask:</strong> ${subnetMask}</p>
        <p><strong>Alamat Jaringan (Network):</strong> ${networkAddress}</p>
        <p><strong>Alamat Broadcast:</strong> ${broadcastAddress}</p>
        <p><strong>Total Alamat IP:</strong> ${totalAddresses}</p>
        <p><strong>Jumlah Host yang Dapat Digunakan:</strong> ${usableHosts}</p>
        <p><strong>Rentang Host yang Dapat Digunakan:</strong> ${firstHost} hingga ${lastHost}</p>
    `;
}