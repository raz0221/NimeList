import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Image } from "expo-image";

import { auth, db } from "@/src/lib/firebase";
import { ThemedText } from "@/components/themed-text";
import { NeoButton, NeoInput } from "@/components/NeoKit";
import { useTranslation } from "react-i18next";

export default function EditProfileScreen() {
  const user = auth.currentUser;
  const { t } = useTranslation();
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [avatarSeed, setAvatarSeed] = useState(user?.uid || "default");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.bio) setBio(data.bio);
          if (data.avatarSeed) setAvatarSeed(data.avatarSeed);
          if (data.displayName) setDisplayName(data.displayName);
        }
      } catch (e) {
        console.error("Error loading profile", e);
      }
    };
    loadProfile();
  }, [user]);

  const generateRandomSeed = () => {
    const randomWords = ["Anime", "Otaku", "Ninja", "Hero", "Demon", "Mage", "Samurai", "Kawaii"];
    const seed = randomWords[Math.floor(Math.random() * randomWords.length)] + Math.floor(Math.random() * 1000);
    setAvatarSeed(seed);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // 1. Update Firebase Auth displayName
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // 2. Update Firestore user doc
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        bio,
        avatarSeed
      }, { merge: true });

      Alert.alert("Sukses", "Profil berhasil diperbarui!");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText style={{ fontSize: 18, marginBottom: 20, fontWeight: 'bold' }}>
          Silakan login untuk mengedit profil.
        </ThemedText>
        <NeoButton title="Login Sekarang" onPress={() => router.push("/(tabs)/profile/login")} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <NeoButton
          title={`← ${t("Kembali")}`}
          color={COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }}
        />
        <ThemedText type="title">{t("Edit Profil")}</ThemedText>
      </View>

      <View style={styles.formSection}>
        {/* Avatar Customization */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${avatarSeed}` }}
              style={styles.avatar}
            />
          </View>
          <NeoButton 
            title="🎲 Acak Avatar" 
            color={COLORS.ACCENT} 
            onPress={generateRandomSeed} 
            textStyle={{ color: '#fff', fontSize: 13, paddingVertical: 10, paddingHorizontal: 16 }}
          />
        </View>

        {/* Display Name */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>{t("Nama Tampilan")}</ThemedText>
          <NeoInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Masukkan nama tampilan..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
          />
        </View>

        {/* Bio */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>{t("Bio (Tentang Kamu)")}</ThemedText>
          <NeoInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tulis sesuatu tentang dirimu..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={150}
            style={{ minHeight: 100 }}
          />
          <ThemedText style={styles.charCount}>{bio.length}/150</ThemedText>
        </View>

        <NeoButton 
          title={isSaving ? "Menyimpan..." : "💾 Simpan Perubahan"} 
          color={STATUS_COLORS.ON_AIR} 
          onPress={handleSave} 
          style={{ marginTop: 24 }}
        />
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  formSection: { backgroundColor: COLORS.CARD_BACKGROUND, padding: 20, borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, borderColor: '#000' },
  
  avatarSection: { alignItems: 'center', marginBottom: 24, gap: 16 },
  avatarWrap: { 
    width: 100, height: 100, borderRadius: 50, 
    borderWidth: 3, borderColor: "#000", 
    backgroundColor: "#fff", overflow: "hidden" 
  },
  avatar: { width: "100%", height: "100%" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: COLORS.TEXT_MAIN, marginBottom: 8 },
  charCount: { fontSize: 12, color: COLORS.TEXT_SECONDARY, alignSelf: 'flex-end', marginTop: 6, fontWeight: 'bold' }
});
