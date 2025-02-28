// Yoklama raporu fonksiyonları kaldırıldı

async function getOgretmenler() {
    try {
        console.log("Öğretmenler getiriliyor...");
        const { data, error } = await supabaseClient
            .from('ogretmenler')
            .select('*')
            .order('ad', { ascending: true });

        if (error) {
            console.error('Supabase Hatası:', error);
            throw error;
        }

        console.log("Gelen veri:", data);

        const select = document.getElementById('ogretmenSelect');
        
        if (data && data.length > 0) {
            data.forEach(ogretmen => {
                const option = document.createElement('option');
                option.value = ogretmen.id;
                option.textContent = `${ogretmen.ad} ${ogretmen.soyad} - ${ogretmen.brans}`;
                select.appendChild(option);
            });
        } else {
            console.log("Veri bulunamadı");
        }

    } catch (error) {
        console.error('Genel Hata:', error);
    }
}

function ogretmenSecildi() {
    const tcNoAlani = document.getElementById('tcNoAlani');
    const tcNoInput = document.getElementById('tcNo');
    const select = document.getElementById('ogretmenSelect');
    const errorMessage = document.getElementById('errorMessage');
    
    if (select.value !== "") {
        tcNoAlani.style.display = 'block';
        tcNoInput.disabled = false;
        tcNoInput.value = ''; // Clear previous input
        tcNoInput.focus(); // Set focus to TC input
        errorMessage.style.display = 'none';
    } else {
        tcNoAlani.style.display = 'none';
        tcNoInput.disabled = true;
    }
}

async function girisKontrol() {
    const ogretmenId = document.getElementById('ogretmenSelect').value;
    const tcNo = document.getElementById('tcNo').value;
    const errorMessage = document.getElementById('errorMessage');

    if (!ogretmenId || !tcNo) {
        errorMessage.textContent = 'Lütfen tüm alanları doldurun.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('ogretmenler')
            .select('*')
            .eq('id', ogretmenId)
            .eq('tc_no', tcNo)
            .single();

        if (error) throw error;

        if (data) {
            localStorage.setItem('ogretmenId', ogretmenId);
            if (tcNo === '12345678910') {
                document.getElementById('girisContainer').style.display = 'none';
                document.getElementById('ozelButonlarContainer').style.display = 'block';
            } else {
                sinifSecimi();
            }
        } else {
            errorMessage.textContent = 'TC kimlik numarası hatalı!';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        errorMessage.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
        errorMessage.style.display = 'block';
    }
}

function sinifSecimi() {
    document.getElementById('girisContainer').style.display = 'none';
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tarihSec').value = today;
    
    document.getElementById('tarihContainer').style.display = 'block';
}

// Tarih seçildiğinde çalışan fonksiyon - gün değerini hesaplayıp siniflar tablosundan filtreleme yapar
async function tarihSec() {
    const tarih = document.getElementById('tarihSec').value;
    if (!tarih) {
        alert('Lütfen bir tarih seçiniz');
        return;
    }

    // Seçilen tarihin gün değerini hesapla (0-6, Pazar=0, Cumartesi=6)
    let dayOfWeek = new Date(tarih).getDay();
    
    // Gün adını Türkçe olarak belirle
    const gunAdlari = ["PAZAR", "PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE", "CUMA", "CUMARTESİ"];
    const gunAdi = gunAdlari[dayOfWeek];
    
    console.log('Seçilen tarih:', tarih);
    console.log('Gün adı:', gunAdi);
    
    // Sadece hafta içi günleri için işlem yap (Pazartesi-Cuma)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        alert('Sadece hafta içi günleri (Pazartesi-Cuma) seçilebilir. Lütfen başka bir tarih seçiniz.');
        return;
    }
    
    try {
        // Seçilen güne göre siniflar tablosundan sınıfları getir
        const { data, error } = await supabaseClient
            .from('siniflar')
            .select('id, ad, gun')
            .eq('gun', gunAdi) // Gün adına göre filtreleme yapılıyor
            .order('ad', { ascending: true });

        if (error) {
            console.error('Supabase sorgu hatası:', error);
            throw error;
        }

        console.log('Veritabanı sorgusu sonucu:', data);

        // Sınıf seçim dropdown'ını güncelle
        const sinifSelect = document.getElementById('sinifSelect');
        sinifSelect.innerHTML = '<option value="">Sınıf Seçiniz</option>';

        if (data && data.length > 0) {
            data.forEach(sinif => {
                const option = document.createElement('option');
                option.value = sinif.id;
                option.textContent = sinif.ad;
                sinifSelect.appendChild(option);
            });
        } else {
            console.log('Seçilen gün:', gunAdi);
            console.log('Veritabanı sorgusu sonucu:', data);
            alert('Bu güne ait sınıf bulunamadı. Lütfen başka bir tarih seçiniz veya yöneticinize başvurunuz.');
            return;
        }

        localStorage.setItem('seciliTarih', tarih);
        document.getElementById('seciliTarih').textContent = new Date(tarih).toLocaleDateString('tr-TR');
        
        document.getElementById('tarihContainer').style.display = 'none';
        document.getElementById('sinifContainer').style.display = 'block';

    } catch (error) {
        console.error('Sınıf getirme hatası:', error);
        alert('Sınıflar yüklenirken bir hata oluştu');
    }
}

// Add this function if it's missing
function geriDonTarih() {
    // Hide all containers first
    document.getElementById('girisContainer').style.display = 'none';
    document.getElementById('ozelButonlarContainer').style.display = 'none';
    document.getElementById('tarihContainer').style.display = 'none';
    document.getElementById('sinifContainer').style.display = 'none';
    document.getElementById('dersSaatiContainer').style.display = 'none';
    document.getElementById('ogrenciListesiContainer').style.display = 'none';
    
    // Check if user came from special buttons or regular login
    if (document.getElementById('tcNo').value === '12345678910') {
        document.getElementById('ozelButonlarContainer').style.display = 'block';
    } else {
        document.getElementById('girisContainer').style.display = 'block';
    }
}

function geriDonSinif() {
    // Hide all containers first
    document.getElementById('girisContainer').style.display = 'none';
    document.getElementById('ozelButonlarContainer').style.display = 'none';
    document.getElementById('tarihContainer').style.display = 'none';
    document.getElementById('sinifContainer').style.display = 'none';
    document.getElementById('dersSaatiContainer').style.display = 'none';
    document.getElementById('ogrenciListesiContainer').style.display = 'none';
    
    // Show only the tarih container
    document.getElementById('tarihContainer').style.display = 'block';
}

async function sinifSec() {
    const sinifId = document.getElementById('sinifSelect').value;
    if (!sinifId) {
        alert('Lütfen bir sınıf seçiniz');
        return;
    }
    
    try {
        // Seçilen sınıfın bilgilerini al
        const { data: sinifData, error: sinifError } = await supabaseClient
            .from('siniflar')
            .select('*')
            .eq('id', sinifId)
            .single();
            
        if (sinifError) throw sinifError;
        
        // Sınıf bilgisini localStorage'a kaydet
        localStorage.setItem('seciliSinif', sinifId);
        document.getElementById('seciliSinif').textContent = sinifData.ad;
        
        // Öğretmen bilgisini göster
        const ogretmenId = localStorage.getItem('ogretmenId');
        const { data: ogretmenData, error: ogretmenError } = await supabaseClient
            .from('ogretmenler')
            .select('*')
            .eq('id', ogretmenId)
            .single();
            
        if (ogretmenError) throw ogretmenError;
        
        document.getElementById('seciliOgretmen').textContent = `${ogretmenData.ad} ${ogretmenData.soyad}`;
        
        // Sınıf seçim ekranını gizle, ders saati seçim ekranını göster
        document.getElementById('sinifContainer').style.display = 'none';
        document.getElementById('dersSaatiContainer').style.display = 'block';
        
    } catch (error) {
        console.error('Sınıf seçim hatası:', error);
        alert('Sınıf seçiminde bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

function dersSaatiSec(button) {
    // Toggle active class on clicked button instead of removing from all
    button.classList.toggle('active');
    
    // Get all selected ders saatleri
    const selectedButtons = document.querySelectorAll('.ders-saatleri button.active');
    const selectedDersSaatleri = Array.from(selectedButtons).map(btn => btn.textContent);
    
    // Save selected ders saatleri to localStorage
    localStorage.setItem('seciliDersSaati', selectedDersSaatleri.join(', '));
    
    // Update display
    document.getElementById('seciliDersSaati').textContent = selectedDersSaatleri.join(', ') || 'Seçilmedi';
}

function geriDonDersSaati() {
    // Hide all containers first
    document.getElementById('girisContainer').style.display = 'none';
    document.getElementById('ozelButonlarContainer').style.display = 'none';
    document.getElementById('tarihContainer').style.display = 'none';
    document.getElementById('sinifContainer').style.display = 'none';
    document.getElementById('dersSaatiContainer').style.display = 'none';
    document.getElementById('ogrenciListesiContainer').style.display = 'none';
    
    // Show only the ders saati container
    document.getElementById('dersSaatiContainer').style.display = 'block';
}

function geriDonSinif() {
    // Hide all containers first
    document.getElementById('girisContainer').style.display = 'none';
    document.getElementById('ozelButonlarContainer').style.display = 'none';
    document.getElementById('tarihContainer').style.display = 'none';
    document.getElementById('sinifContainer').style.display = 'none';
    document.getElementById('dersSaatiContainer').style.display = 'none';
    document.getElementById('ogrenciListesiContainer').style.display = 'none';
    
    // Show only the tarih container
    document.getElementById('tarihContainer').style.display = 'block';
}

async function sinifSec() {
    const sinifId = document.getElementById('sinifSelect').value;
    if (!sinifId) {
        alert('Lütfen bir sınıf seçiniz');
        return;
    }
    
    try {
        // Seçilen sınıfın bilgilerini al
        const { data: sinifData, error: sinifError } = await supabaseClient
            .from('siniflar')
            .select('*')
            .eq('id', sinifId)
            .single();
            
        if (sinifError) throw sinifError;
        
        // Sınıf bilgisini localStorage'a kaydet
        localStorage.setItem('seciliSinif', sinifId);
        document.getElementById('seciliSinif').textContent = sinifData.ad;
        
        // Öğretmen bilgisini göster
        const ogretmenId = localStorage.getItem('ogretmenId');
        const { data: ogretmenData, error: ogretmenError } = await supabaseClient
            .from('ogretmenler')
            .select('*')
            .eq('id', ogretmenId)
            .single();
            
        if (ogretmenError) throw ogretmenError;
        
        document.getElementById('seciliOgretmen').textContent = `${ogretmenData.ad} ${ogretmenData.soyad}`;
        
        // Sınıf seçim ekranını gizle, ders saati seçim ekranını göster
        document.getElementById('sinifContainer').style.display = 'none';
        document.getElementById('dersSaatiContainer').style.display = 'block';
        
    } catch (error) {
        console.error('Sınıf seçim hatası:', error);
        alert('Sınıf seçiminde bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

async function yoklamaAl() {
    const dersSaati = localStorage.getItem('seciliDersSaati');
    if (!dersSaati) {
        alert('Lütfen en az bir ders saati seçiniz');
        return;
    }
    
    try {
        // Seçilen sınıfın adını al
        const sinifId = localStorage.getItem('seciliSinif');
        const { data: sinifData, error: sinifError } = await supabaseClient
            .from('siniflar')
            .select('ad')
            .eq('id', sinifId)
            .single();
            
        if (sinifError) throw sinifError;
        
        const sinifAdi = sinifData.ad;
        
        // Sınıf adına göre öğrencileri getir
        const { data: ogrenciler, error: ogrenciError } = await supabaseClient
            .from('ogrencilistesi')
            .select('ogrenci_no, ogrenci_ad_soyad, tc_no')
            .eq('sinif_adi', sinifAdi)
            .order('ogrenci_ad_soyad', { ascending: true });
            
        if (ogrenciError) throw ogrenciError;
        
        // Öğrenci listesini oluştur
        const ogrenciListesi = document.getElementById('ogrenciListesi');
        ogrenciListesi.innerHTML = '';
        
        if (ogrenciler && ogrenciler.length > 0) {
            ogrenciler.forEach(ogrenci => {
                // Öğrenci bilgilerini birleştir
                const ogrenciBilgisi = `${ogrenci.ogrenci_no}-${ogrenci.ogrenci_ad_soyad}-${ogrenci.tc_no}`;
                
                const ogrenciDiv = document.createElement('div');
                ogrenciDiv.className = 'ogrenci-item';
                ogrenciDiv.innerHTML = `
                    <span>${ogrenciBilgisi}</span>
                    <button class="durum-btn geldi" onclick="durumDegistir(this, ${ogrenci.ogrenci_no})">GELDİ</button>
                `;
                ogrenciListesi.appendChild(ogrenciDiv);
            });
        } else {
            ogrenciListesi.innerHTML = '<p>Bu sınıfta kayıtlı öğrenci bulunmamaktadır.</p>';
        }
        
        // Ders saati seçim ekranını gizle, öğrenci listesi ekranını göster
        document.getElementById('dersSaatiContainer').style.display = 'none';
        document.getElementById('ogrenciListesiContainer').style.display = 'block';
        
    } catch (error) {
        console.error('Öğrenci listesi getirme hatası:', error);
        alert('Öğrenci listesi yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

function geriDonGiris() {
    // Hide all containers first
    document.getElementById('girisContainer').style.display = 'none';
    document.getElementById('ozelButonlarContainer').style.display = 'none';
    document.getElementById('tarihContainer').style.display = 'none';
    document.getElementById('sinifContainer').style.display = 'none';
    document.getElementById('dersSaatiContainer').style.display = 'none';
    document.getElementById('ogrenciListesiContainer').style.display = 'none';
    
    // Öğretmen seçimini ve TC numarasını sıfırla
    document.getElementById('ogretmenSelect').value = '';
    document.getElementById('tcNo').value = '';
    document.getElementById('tcNoAlani').style.display = 'none';
    document.getElementById('tcNo').disabled = true;
    
    // Show only the giris container
    document.getElementById('girisContainer').style.display = 'block';
}

// Yoklama raporu fonksiyonu kaldırıldı

// Yoklama raporu ile ilgili fonksiyonlar kaldırıldı

function durumDegistir(button, ogrenciId) {
    // Butonun mevcut durumunu kontrol et
    const isGeldi = button.classList.contains('geldi');
    
    if (isGeldi) {
        // GELDİ -> GELMEDİ
        button.classList.remove('geldi');
        button.classList.add('gelmedi');
        button.textContent = 'GELMEDİ';
        button.style.backgroundColor = '#d32f2f';
        
        // Öğrenci durumunu 'yok' olarak kaydet
        const ogrenciDurumlari = JSON.parse(localStorage.getItem('ogrenciDurumlari') || '{}');
        ogrenciDurumlari[ogrenciId] = 'yok';
        localStorage.setItem('ogrenciDurumlari', JSON.stringify(ogrenciDurumlari));
    } else {
        // GELMEDİ -> GELDİ
        button.classList.remove('gelmedi');
        button.classList.add('geldi');
        button.textContent = 'GELDİ';
        button.style.backgroundColor = '#43a047';
        
        // Öğrenci durumunu 'var' olarak kaydet
        const ogrenciDurumlari = JSON.parse(localStorage.getItem('ogrenciDurumlari') || '{}');
        ogrenciDurumlari[ogrenciId] = 'var';
        localStorage.setItem('ogrenciDurumlari', JSON.stringify(ogrenciDurumlari));
    }
}

async function yoklamaKaydet() {
    const sinifId = localStorage.getItem('seciliSinif');
    const ogretmenId = localStorage.getItem('ogretmenId');
    const tarih = localStorage.getItem('seciliTarih');
    const dersSaati = localStorage.getItem('seciliDersSaati');
    let ogrenciDurumlari = JSON.parse(localStorage.getItem('ogrenciDurumlari') || '{}');
    
    if (!sinifId || !ogretmenId || !tarih || !dersSaati) {
        alert('Eksik bilgi! Lütfen tüm alanları doldurun.');
        return;
    }
    
    // Tüm öğrencileri GELDİ olarak işaretleme - kullanıcının isteğine göre
    // Öğrenci durumları boş olsa bile devam et
    
    try {
        // Seçilen sınıfın adını al
        const { data: sinifData, error: sinifError } = await supabaseClient
            .from('siniflar')
            .select('ad')
            .eq('id', sinifId)
            .single();
            
        if (sinifError) throw sinifError;
        
        const sinifAdi = sinifData.ad;
        
        // Öğretmen bilgilerini al
        const { data: ogretmenData, error: ogretmenError } = await supabaseClient
            .from('ogretmenler')
            .select('ad, soyad')
            .eq('id', ogretmenId)
            .single();
            
        if (ogretmenError) throw ogretmenError;
        
        const ogretmenAdSoyad = `${ogretmenData.ad} ${ogretmenData.soyad}`;
        
        // Sınıftaki tüm öğrencileri getir
        const { data: ogrenciler, error: ogrenciError } = await supabaseClient
            .from('ogrencilistesi')
            .select('ogrenci_no, ogrenci_ad_soyad, tc_no')
            .eq('sinif_adi', sinifAdi)
            .order('ogrenci_no', { ascending: true });
            
        if (ogrenciError) throw ogrenciError;
        
        // Tüm öğrencileri GELDİ olarak işaretle
        // Öğrenci durumlarını güncelle - tüm öğrenciler için 'var' değerini ata
        ogrenciler.forEach(ogrenci => {
            ogrenciDurumlari[ogrenci.ogrenci_no] = 'var';
        });
        
        // Güncellenmiş durumları localStorage'a kaydet
        localStorage.setItem('ogrenciDurumlari', JSON.stringify(ogrenciDurumlari));
        
        // Gelmeyen öğrencileri filtrele - artık boş bir dizi olacak
        const gelmeyenOgrenciler = [];
        
        console.log('Gelmeyen öğrenciler:', gelmeyenOgrenciler);
        
        // Ders saatlerini ayır (virgülle ayrılmış olabilir)
        const dersSaatleri = dersSaati.split(',').map(ds => ds.trim());
        
        // Tüm öğrenciler geldi mi kontrol et
        const tumOgrencilerGeldi = true; // Artık her zaman true olacak
        console.log('Tüm öğrenciler geldi:', tumOgrencilerGeldi);
        
        // Önce seçilen sınıf, tarih ve ders saatleri için mevcut kayıtları kontrol et
        let kayitVarMi = false;
        
        for (const ds of dersSaatleri) {
            const { data: mevcutKayit, error: kayitError } = await supabaseClient
                .from('yoklama')
                .select('id')
                .eq('sinif', sinifAdi)
                .eq('tarih', tarih)
                .eq('ders_saati', ds);
                
            if (kayitError) throw kayitError;
            
            if (mevcutKayit && mevcutKayit.length > 0) {
                kayitVarMi = true;
                break;
            }
        }
        
        // Eğer mevcut kayıt varsa, kullanıcıya sor
        if (kayitVarMi) {
            const onay = confirm('Bu saate daha önce yoklama kaydedilmiş, güncellensin mi?');
            if (!onay) {
                alert('Yoklama güncelleme işlemi iptal edildi.');
                return;
            }
            
            // Onay verildiyse, her ders saati için mevcut kayıtları güncelle
            for (const ds of dersSaatleri) {
                // Mevcut kaydı getir
                const { data: mevcutKayit, error: kayitGetirmeError } = await supabaseClient
                    .from('yoklama')
                    .select('*')
                    .eq('sinif', sinifAdi)
                    .eq('tarih', tarih)
                    .eq('ders_saati', ds);
                    
                if (kayitGetirmeError) throw kayitGetirmeError;
                
                if (mevcutKayit && mevcutKayit.length > 0) {
                    // Güncel tarih ve saat bilgisini al
                    const simdi = new Date();
                    const guncelleme_tarihi = simdi.toISOString();
                    
                    // Kaydı güncelle - gelmeyen öğrenciler boş olacak
                    const { error: guncellemeError } = await supabaseClient
                        .from('yoklama')
                        .update({
                            gelmeyen_ogrenciler: '', // Tüm öğrenciler geldi, boş bırak
                            guncelleme_tarihi: guncelleme_tarihi
                        })
                        .eq('id', mevcutKayit[0].id);
                        
                    if (guncellemeError) throw guncellemeError;
                }
            }
        }
        
        // Her ders saati için ayrı bir kayıt oluştur - gelmeyen öğrenciler boş olacak
        for (const ds of dersSaatleri) {
            // Mevcut kayıt var mı kontrol et
            const { data: mevcutKayit, error: kayitKontrolError } = await supabaseClient
                .from('yoklama')
                .select('*')
                .eq('sinif', sinifAdi)
                .eq('tarih', tarih)
                .eq('ders_saati', ds);
                
            if (kayitKontrolError) throw kayitKontrolError;
            
            // Güncel tarih ve saat bilgisini al
            const simdi = new Date();
            const guncelleme_tarihi = simdi.toISOString();
            
            // Eğer mevcut kayıt varsa güncelle, yoksa yeni kayıt oluştur
            if (mevcutKayit && mevcutKayit.length > 0) {
                // Kaydı güncelle - gelmeyen öğrenciler boş olacak
                const { error: guncellemeError } = await supabaseClient
                    .from('yoklama')
                    .update({
                        gelmeyen_ogrenciler: '', // Tüm öğrenciler geldi, boş bırak
                        guncelleme_tarihi: guncelleme_tarihi
                    })
                    .eq('id', mevcutKayit[0].id);
                    
                if (guncellemeError) throw guncellemeError;
            } else {
                // Yeni kayıt oluştur - gelmeyen öğrenciler boş olacak
                const yoklamaKaydi = {
                    sinif: sinifAdi,
                    ders_saati: ds,
                    ogretmen: ogretmenAdSoyad,
                    gelmeyen_ogrenciler: '', // Tüm öğrenciler geldi, boş bırak
                    tarih: tarih,
                    tc_no: '', // Gelmeyen öğrenci yok
                    guncelleme_tarihi: guncelleme_tarihi
                };
            
                console.log('Yoklama kaydı (Tüm öğrenciler geldi):', yoklamaKaydi);
            
                const { error: yoklamaError } = await supabaseClient
                    .from('yoklama')
                    .insert(yoklamaKaydi);
                
                if (yoklamaError) throw yoklamaError;
            }
        }
        
        // Başarılı mesajı göster
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Yoklama başarıyla kaydedildi!';
        successMessage.style.position = 'fixed';
        successMessage.style.top = '50%';
        successMessage.style.left = '50%';
        successMessage.style.transform = 'translate(-50%, -50%)';
        successMessage.style.backgroundColor = '#43a047';
        successMessage.style.color = 'white';
        successMessage.style.padding = '20px';
        successMessage.style.borderRadius = '5px';
        successMessage.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        successMessage.style.zIndex = '1000';
        successMessage.style.fontSize = '18px';
        document.body.appendChild(successMessage);
        
        // 2 saniye sonra mesajı kaldır ve ana ekrana dön
        setTimeout(() => {
            document.body.removeChild(successMessage);
            // Temizlik işlemleri
            localStorage.removeItem('ogrenciDurumlari');
            // Ders saati seçimlerini temizle
            localStorage.removeItem('seciliDersSaati');
            document.getElementById('seciliDersSaati').textContent = 'Seçilmedi';
            // Ders saati butonlarından active sınıfını kaldır
            const dersSaatiButtons = document.querySelectorAll('.ders-saatleri button');
            dersSaatiButtons.forEach(btn => btn.classList.remove('active'));
            // Öğretmen seçimini ve TC numarasını sıfırla
            document.getElementById('ogretmenSelect').value = '';
            document.getElementById('tcNo').value = '';
            document.getElementById('tcNoAlani').style.display = 'none';
            document.getElementById('tcNo').disabled = true;
            // Ana ekrana dön
            document.getElementById('ogrenciListesiContainer').style.display = 'none';
            document.getElementById('girisContainer').style.display = 'block';
        }, 2000);
        
    } catch (error) {
        console.error('Yoklama kaydetme hatası:', error);
        alert('Yoklama kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    getOgretmenler();
});

console.log("Script file initialized.");
