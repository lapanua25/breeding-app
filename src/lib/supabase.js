import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blnbyntjpddiyujuewsc.supabase.co';
const supabaseKey = 'sb_publishable_xY0Paeugw3xB_yrMjhKmLQ_kUVrfZKE';
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Image Utility ---
export const compressImage = (file, maxWidth, maxHeight, quality) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

export function dataURLtoBlob(dataurl) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

// --- Authentication Functions ---

/**
 * ゲストモード（匿名認証）でサインイン
 */
export const signInAsGuest = async () => {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('ゲストサインイン失敗:', error);
    throw error;
  }
};

/**
 * Google OAuth でサインイン
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Google OAuth サインイン失敗:', error);
    throw error;
  }
};

/**
 * メールアドレスでサインアップ（新規登録）
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('メール登録失敗:', error);
    throw error;
  }
};

/**
 * メールアドレスでサインイン（ログイン）
 */
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('メールサインイン失敗:', error);
    throw error;
  }
};

/**
 * ゲストユーザーかどうかを判定
 */
export const isGuestUser = (session) => {
  return session?.user?.is_anonymous === true;
};

/**
 * ゲストから認証済みユーザーへのデータマイグレーション
 * ゲストで作成したすべてのデータを新しい user_id に更新
 */
export const migrateGuestToAuth = async (guestId, newUserId) => {
  try {
    const tables = ['individuals', 'trait_logs', 'individual_images', 'settings'];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .update({ user_id: newUserId })
        .eq('user_id', guestId);

      if (error) {
        console.error(`マイグレーション失敗 (${table}):`, error);
        throw error;
      }
    }

    console.log('マイグレーション完了:', guestId, '->', newUserId);
    return true;
  } catch (error) {
    console.error('マイグレーション処理中にエラー:', error);
    throw error;
  }
};
