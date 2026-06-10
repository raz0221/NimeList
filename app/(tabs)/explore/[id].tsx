import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { ThemedText } from "@/components/themed-text";

export default function AnimeDetailScreen() {
  const { id } = useLocalSearchParams();
  const [review, setReview] = useState("");
  const [reviewsList, setReviewsList] = useState<{id: string, text: string}[]>([]);

  const handleKirimUlasan = () => {
    if (!review.trim()) {
      Alert.alert("Error", "Ulasan tidak boleh kosong!");
      return;
    }
    Alert.alert("Sukses", "Ulasan berhasil dikirim!");
    setReviewsList([{ id: Date.now().toString(), text: review }, ...reviewsList]);
    setReview("");
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        <View style={styles.imageShadow} />
        <Image 
          source={{ uri: "https://myanimelist.net/images/anime/1171/109222.jpg" }} 
          style={styles.image} 
          contentFit="cover" 
        />
      </View>

      <ThemedText type="title" style={styles.title}>Detail Anime {id}</ThemedText>
      <ThemedText style={styles.synopsis}>
        Ini adalah sinopsis dummy untuk anime dengan ID {id}. Anime ini mengisahkan petualangan luar biasa di dunia penuh keajaiban dan tantangan.
      </ThemedText>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Tulis Ulasan & Rating</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Tulis pendapatmu tentang anime ini..."
          placeholderTextColor="#9CA3AF"
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.button} onPress={handleKirimUlasan}>
          <ThemedText style={styles.buttonText}>Kirim Ulasan</ThemedText>
        </TouchableOpacity>
      </View>

      {reviewsList.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Ulasan Terbaru</ThemedText>
          <View style={styles.reviewsContainer}>
            {reviewsList.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <ThemedText style={styles.reviewText}>"{r.text}"</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFD166', alignSelf: 'flex-start', marginBottom: 20, marginTop: 40, ...Neubrutalism },
  imageContainer: { width: "100%", height: 300, marginBottom: 20 },
  imageShadow: { position: "absolute", top: 8, left: 8, width: "100%", height: "100%", backgroundColor: "#000000" },
  image: { width: "100%", height: "100%", ...Neubrutalism },
  title: { color: "#000000", marginBottom: 12 },
  synopsis: { color: "#374151", fontSize: 16, lineHeight: 24, marginBottom: 30 },
  section: { marginBottom: 30 },
  sectionTitle: { color: "#000000", fontWeight: "900", marginBottom: 16 },
  input: { backgroundColor: "#FFFFFF", padding: 16, fontSize: 16, color: "#000000", minHeight: 100, ...Neubrutalism },
  button: { backgroundColor: "#06D6A0", padding: 16, alignItems: "center", marginTop: 12, ...Neubrutalism },
  buttonText: { color: "#000000", fontSize: 16, fontWeight: "900" },
  reviewsContainer: { gap: 12 },
  reviewCard: { backgroundColor: "#118AB2", padding: 16, ...Neubrutalism },
  reviewText: { color: "#FFFFFF", fontSize: 16, fontStyle: "italic", fontWeight: "bold" },
});
