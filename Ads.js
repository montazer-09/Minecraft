// تهيئة AdMob
let adMobInitialized = false;

async function initializeAdMob() {
    try {
        await admob.start();
        adMobInitialized = true;
        loadAvailableAds();
    } catch (error) {
        console.error("Error initializing AdMob:", error);
    }
}

// تحميل الإعلانات المتاحة
function loadAvailableAds() {
    const adsContainer = document.getElementById('adsContainer');
    adsContainer.innerHTML = '';

    const availableAds = [
        { id: 1, type: 'video', reward: 50, duration: '30 ثانية' },
        { id: 2, type: 'interstitial', reward: 30, duration: '15 ثانية' },
        { id: 3, type: 'rewarded', reward: 100, duration: '60 ثانية' }
    ];

    availableAds.forEach(ad => {
        const adElement = createAdElement(ad);
        adsContainer.appendChild(adElement);
    });
}

// إنشاء عنصر الإعلان
function createAdElement(ad) {
    const div = document.createElement('div');
    div.className = 'bg-gray-50 p-4 rounded-lg mb-4';
    div.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                <h3 class="font-medium">إعلان
${ad.type}</h3>
                <p class="text-sm text-gray-500">المدة: $
{ad.duration}</p>
                <p class="text-sm text-green-500">المكافأة:
${ad.reward} نقطة</p>
            </div>
            <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                    onclick="showAd($
{ad.id})">
                مشاهدة
            </button>
        </div>
    `;
    return div;
}

// عرض الإعلان
async function showAd(adId) {
    if (!currentUser) {
        alert("يجب تسجيل الدخول أولاً!");
        return;
    }

    try {
        // تحميل الإعلان المناسب حسب النوع
        const options = {
            id: 'ca-app-pub-xxx/xxx', // استبدل برقم وحدة الإعلان الخاص بك
        };

        await admob.showRewardedVideo(options);
        
        // إضافة المكافأة بعد مشاهدة الإعلان
        await rewardUser(adId);
    } catch (error) {
        console.error("Error showing ad:", error);
        alert("حدث خطأ أثناء تحميل الإعلان");
    }
}

// مكافأة المستخدم
async function rewardUser(adId) {
    try {
        const reward = calculateReward(adId);
        await db.collection('users').doc(currentUser.uid).update({
            points: firebase.firestore.FieldValue.increment(reward),
            balance: firebase.firestore.FieldValue.increment(reward / 1000) // تحويل النقاط إلى دولارات
        });

        await db.collection('adViews').add({
            userId: currentUser.uid,
            adId: adId,
            reward: reward,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        updateUserInfo();
        alert(`تمت إضافة
${reward} نقطة إلى حسابك!`);
    } catch (error) {
        console.error("Error rewarding user:", error);
    }
}

// حساب المكافأة
function calculateReward(adId) {
    // يمكن تخصيص المكافآت حسب نوع الإعلان
    const rewards = {
        1: 50,
        2: 30,
        3: 100
    };
    return rewards[adId] || 0;
}
