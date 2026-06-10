import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { ThemedText } from "@/components/themed-text";

export default function EditProfileScreen() {
  const [nama, setNama] = useState("Pengguna Anime");
  const [bio, setBio] = useState("Pecinta Shounen");
  const [savedData, setSavedData] = useState({ nama: "", bio: "" });

  const handleSimpan = () => {
    Alert.alert("Sukses", "Profil Diperbarui!");
    setSavedData({ nama, bio });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Edit Profil</ThemedText>
      </View>

      {savedData.nama ? (
        <View style={styles.preview}>
          <ThemedText style={styles.previewTitle}>Data Tersimpan:</ThemedText>
          <ThemedText style={{fontWeight: 'bold'}}>Nama: {savedData.nama}</ThemedText>
          <ThemedText style={{fontStyle: 'italic'}}>Bio: {savedData.bio}</ThemedText>
        </View>
      ) : null}

      <View style={styles.formContainer}>
        <TextInput style={styles.input} placeholder="Nama Lengkap" value={nama} onChangeText={setNama} />
        <TextInput style={[styles.input, {height: 100}]} placeholder="Bio" value={bio} onChangeText={setBio} multiline textAlignVertical="top" />
        
        <TouchableOpacity style={styles.button} onPress={handleSimpan}>
          <ThemedText style={styles.buttonText}>Simpan Perubahan</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFD166', alignSelf: 'flex-start', marginBottom: 16, ...Neubrutalism },
  formContainer: { gap: 16 },
  input: { ...Neubrutalism, padding: 16, fontSize: 16, backgroundColor: "#FFFFFF", color: "#000000" },
  button: { height: 50, backgroundColor: "#06D6A0", ...Neubrutalism, justifyContent: "center", alignItems: "center", marginTop: 8 },
  buttonText: { color: "#000000", fontSize: 18, fontWeight: "900" },
  preview: { backgroundColor: "#EF476F", padding: 16, marginBottom: 20, ...Neubrutalism },
  previewTitle: { fontWeight: "900", color: "#FFF", marginBottom: 8 }
});
