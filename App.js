// تهيئة Firebase
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// المتغيرات العامة
let currentUser = null;
let userPoints = 0;
let userBalance = 0;

// تحديث معلومات المستخدم
async function updateUserInfo() {
    if (!currentUser) return;

    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        userPoints = userData.points || 0;
        userBalance = userData.balance || 0;

        document.getElementById('currentBalance').textContent = `${userBalance.toFixed(2)}$`;
        document.getElementById('pointsEarned').textContent = userPoints;
        
        loadDailyTasks();
        loadAvailableAds();
    } catch (error) {
        console.error("Error updating user info:", error);
    }
}

// تحميل المهام اليومية
function loadDailyTasks() {
    const tasksContainer = document.getElementById('dailyTasksContainer');
    tasksContainer.innerHTML = '';

    const dailyTasks = [
        { id: 1, title: "شاهد 5 إعلانات", reward: 50, progress: 0, target: 5 },
        { id: 2, title: "ادعُ صديقاً", reward: 100, progress: 0, target: 1 },
        { id: 3, title: "أكمل جميع المهام اليومية", reward: 200, progress: 0, target: 1 }
    ];

    dailyTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksContainer.appendChild(taskElement);
    });
}

// إنشاء عنصر المهمة
function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center p-3 border rounded mb-2';
    div.innerHTML = `
        <div>
            <h3 class="font-medium">$
{task.title}</h3>
            <p class="text-sm text-gray-500">المكافأة:
${task.reward} نقطة</p>
        </div>
        <div class="flex items-center">
            <span class="ml-2">${task.progress}/${task.target}</span>
            <button class="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    onclick="completeTask($
{task.id})">
                إكمال
            </button>
        </div>
    `;
    return div;
}

// نظام سحب الأرباح
async function withdrawEarnings() {
    if (userBalance < 10) {
        alert("يجب أن يكون لديك على الأقل 10
$ للسحب");
        return;
    }

    try {
        const withdrawalAmount = userBalance;
        await db.collection('withdrawals').add({
            userId: currentUser.uid,
            amount: withdrawalAmount,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('users').doc(currentUser.uid).update({
            balance: firebase.firestore.FieldValue.increment(-withdrawalAmount)
        });

        alert("تم تقديم طلب السحب بنجاح!");
        updateUserInfo();
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        alert("حدث خطأ أثناء معالجة طلب السحب");
    }
}

// إضافة المستمعين للأحداث
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('withdrawBtn').addEventListener('click', withdrawEarnings);
});
