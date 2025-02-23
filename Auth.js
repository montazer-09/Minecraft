// متغيرات عناصر واجهة المستخدم
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// تسجيل الدخول
async function login(email, password) {
    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        currentUser = result.user;
        updateUserInfo();
        closeLoginModal();
    } catch (error) {
        alert("خطأ في تسجيل الدخول: " + error.message);
    }
}

// تسجيل مستخدم جديد
async function register(email, password, name) {
    try {
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        await db.collection('users').doc(result.user.uid).set({
            name: name,
            email: email,
            points: 0,
            balance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        currentUser = result.user;
        updateUserInfo();
        closeLoginModal();
    } catch (error) {
        alert("خطأ في التسجيل: " + error.message);
    }
}

// تسجيل الدخول باستخدام Google
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        currentUser = result.user;
        
        // التحقق مما إذا كان المستخدم جديداً
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (!userDoc.exists) {
            await db.collection('users').doc(currentUser.uid).set({
                name: currentUser.displayName,
                email: currentUser.email,
                points: 0,
                balance: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        updateUserInfo();
        closeLoginModal();
    } catch (error) {
        alert("خطأ في تسجيل الدخول باستخدام Google: " + error.message);
    }
}

// مراقبة حالة المصادقة
firebase.auth().onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        updateUserInfo();
        document.querySelector('.flex.items-center.space-x-3').innerHTML = `
            <span class="text-gray-500">مرحباً، $
{user.displayName || user.email}</span>
            <button onclick="logout()" class="py-2 px-3 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300">
                تسجيل خروج
            </button>
        `;
    }
});

// تسجيل الخروج
async function logout() {
    try {
        await firebase.auth().signOut();
        currentUser = null;
        location.reload();
    } catch (error) {
        console.error("Error logging out:", error);
    }
}
