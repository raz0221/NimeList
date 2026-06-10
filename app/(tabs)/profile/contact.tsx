import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { ThemedText } from "@/components/themed-text";

export default function ContactScreen() {
  const [keluhan, setKeluhan] = useState("");
  const [history, setHistory] = useState<{id: string, text: string}[]>([]);

  const handleKirim = () => {
    if(!keluhan) {
      Alert.alert("Error", "Keluhan tidak boleh kosong!");
      return;
    }
    Alert.alert("Terkirim", "Pesan terkirim ke sistem!");
    setHistory([{id: Date.now().toString(), text: keluhan}, ...history]);
    setKeluhan("");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Hubungi Kami</ThemedText>
      </View>

      <View style={styles.formContainer}>
        <TextInput 
          style={[styles.input, {height: 120}]} 
          placeholder="Tulis keluhan atau masukan Anda..." 
          placeholderTextColor="#9CA3AF"
          value={keluhan} 
          onChangeText={setKeluhan} 
          multiline 
          textAlignVertical="top" 
        />
        
        <TouchableOpacity style={styles.button} onPress={handleKirim}>
          <ThemedText style={styles.buttonText}>Kirim Pesan</ThemedText>
        </TouchableOpacity>
      </View>

      {history.length > 0 && (
        <View style={styles.historySection}>
          <ThemedText style={styles.historyTitle}>Riwayat Tiket:</ThemedText>
          {history.map(item => (
            <View key={item.id} style={styles.ticket}>
              <ThemedText style={{color: '#FFF'}}>{item.text}</ThemedText>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFD166', alignSelf: 'flex-start', marginBottom: 16, ...Neubrutalism },
  formContainer: { gap: 16, marginBottom: 24 },
  input: { ...Neubrutalism, padding: 16, fontSize: 16, backgroundColor: "#FFFFFF", color: "#000000" },
  button: { height: 50, backgroundColor: "#FFD166", ...Neubrutalism, justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#000000", fontSize: 18, fontWeight: "900" },
  historySection: { gap: 12 },
  historyTitle: { fontWeight: "900", fontSize: 16, color: "#000" },
  ticket: { backgroundColor: "#118AB2", padding: 16, ...Neubrutalism }
});
