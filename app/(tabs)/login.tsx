import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Error", "Username dan Password tidak boleh kosong!");
      return;
    }
    Alert.alert("Login Info", `Username: ${username}\nPassword: ${password}`);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#111827", dark: "#0F172A" }}
      headerImage={
        <Image
          source={{
            uri: "https://4kwallpapers.com/images/walls/thumbs_3t/16712.jpg",
          }}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Masuk ke AniTrack</ThemedText>
      </ThemedView>

      <ThemedText style={styles.slogan}>
        Lacak anime favoritmu sekarang!
      </ThemedText>

      <ThemedView style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#9CA3AF"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <ThemedText style={styles.buttonText}>Masuk</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  slogan: {
    color: "#6B7280",
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "bold",
  },
  formContainer: {
    gap: 16,
  },
  input: {
    height: 50,
    ...Neubrutalism,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  button: {
    height: 50,
    backgroundColor: "#06D6A0", // Bright green for contrast
    ...Neubrutalism,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "900",
  },
  headerImage: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
