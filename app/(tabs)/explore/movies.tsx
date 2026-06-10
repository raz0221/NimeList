import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const DUMMY_MOVIES = [
  { id: "m1", title: "Kimi no Na wa.", img: "https://myanimelist.net/images/anime/5/87048.jpg", studio: "CoMix Wave Films", color: "#118AB2" },
  { id: "m2", title: "Koe no Katachi", img: "https://myanimelist.net/images/anime/1122/96435.jpg", studio: "Kyoto Animation", color: "#EF476F" },
  { id: "m3", title: "Suzume no Tojimari", img: "https://myanimelist.net/images/anime/1085/127402.jpg", studio: "CoMix Wave Films", color: "#FFD166" },
  { id: "m4", title: "Spirited Away", img: "https://myanimelist.net/images/anime/6/79597.jpg", studio: "Studio Ghibli", color: "#06D6A0" },
  { id: "m5", title: "Weathering with You", img: "https://myanimelist.net/images/anime/1229/104803.jpg", studio: "CoMix Wave Films", color: "#3A86FF" },
];

export default function MoviesScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/explore');
            }
          }} 
          style={styles.backButton}
        >
          <ThemedText style={{ fontWeight: "900", color: "#000" }}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Anime Movie</ThemedText>
        <ThemedText style={styles.subtitle}>Jelajahi film anime layar lebar terbaik</ThemedText>
      </ThemedView>

      <View style={styles.list}>
        {DUMMY_MOVIES.map((movie) => (
          <TouchableOpacity
            key={movie.id}
            style={styles.card}
            onPress={() => router.push(`/explore/${movie.id}`)}
          >
            <View style={styles.cardShadow} />
            <View style={[styles.cardInner, { backgroundColor: movie.color }]}>
              <Image source={{ uri: movie.img }} style={styles.cardImage} contentFit="cover" />
              <View style={styles.cardInfo}>
                <ThemedText style={styles.cardTitle}>{movie.title}</ThemedText>
                <View style={styles.studioBadge}>
                  <ThemedText style={styles.studioText}>{movie.studio}</ThemedText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40, backgroundColor: "transparent" },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#FFD166", alignSelf: "flex-start", marginBottom: 16, ...Neubrutalism },
  subtitle: { color: "#6B7280", marginTop: 8, fontWeight: "bold" },
  
  list: { gap: 20 },
  card: { height: 140 },
  cardShadow: { position: "absolute", top: 6, left: 6, width: "100%", height: "100%", backgroundColor: "#000" },
  cardInner: { flex: 1, flexDirection: "row", overflow: "hidden", ...Neubrutalism },
  cardImage: { width: 100, height: "100%", borderRightWidth: 3, borderColor: "#000" },
  cardInfo: { flex: 1, padding: 16, justifyContent: "center" },
  cardTitle: { fontSize: 20, fontWeight: "900", color: "#000", marginBottom: 12 },
  studioBadge: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", paddingHorizontal: 8, paddingVertical: 4, ...Neubrutalism },
  studioText: { fontSize: 12, fontWeight: "900", color: "#000" },
});
