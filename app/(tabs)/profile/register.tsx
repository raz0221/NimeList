import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { ThemedText } from "@/components/themed-text";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!email || !username || !password) {
      Alert.alert("Error", "Semua kolom harus diisi!");
      return;
    }
    Alert.alert("Sukses", "Akun berhasil dibuat! Silakan login.");
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Daftar Akun</ThemedText>
      </View>

      <View style={styles.formContainer}>
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#9CA3AF" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9CA3AF" value={password} onChangeText={setPassword} secureTextEntry />
        
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <ThemedText style={styles.buttonText}>Daftar Sekarang</ThemedText>
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
  input: { height: 50, ...Neubrutalism, paddingHorizontal: 16, fontSize: 16, backgroundColor: "#FFFFFF", color: "#000000" },
  button: { height: 50, backgroundColor: "#118AB2", ...Neubrutalism, justifyContent: "center", alignItems: "center", marginTop: 8 },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
});
