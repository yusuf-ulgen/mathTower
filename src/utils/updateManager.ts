import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_RELEASE_NOTES } from './releaseNotes';
import { Linking, Platform } from 'react-native';

const LAST_SHOWN_NOTES_VERSION = '@last_shown_notes_version';
// Not: Bu linki kendi Play Store linkinizle değiştirmelisiniz.
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.yusufulgen.mathtowerwar'; 
const DEVELOPER_URL = 'https://play.google.com/store/apps/developer?id=Yusuf+Ulgen';

export const checkShowReleaseNotes = async () => {
  try {
    const lastShownVersion = await AsyncStorage.getItem(LAST_SHOWN_NOTES_VERSION);
    const currentNotesVersion = APP_RELEASE_NOTES.version;

    if (lastShownVersion !== currentNotesVersion) {
      return true;
    }
  } catch (error) {
    console.error("Release notes check error:", error);
  }
  return false;
};

export const markReleaseNotesAsShown = async () => {
  try {
    await AsyncStorage.setItem(LAST_SHOWN_NOTES_VERSION, APP_RELEASE_NOTES.version);
  } catch (error) {
    console.error("Release notes save error:", error);
  }
};

export const checkForUpdate = async () => {
    try {
        // Burada normalde bir API'ye veya Firebase Config'e istek atılır. 
        // Şimdilik sistemin hazır olması için fonksiyonu tanımlıyoruz.
        // Güncelleme uyarısını test etmek isterseniz burayı true yapabilirsiniz.
        return false; 
    } catch (e) {
        return false;
    }
};

export const redirectToPlayStore = () => {
    Linking.openURL(PLAY_STORE_URL).catch(err => console.error("Link error:", err));
};

export const redirectToDeveloperProfile = () => {
    Linking.openURL(DEVELOPER_URL).catch(err => console.error("Link error:", err));
};
