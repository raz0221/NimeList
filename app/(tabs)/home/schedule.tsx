import { NeoButton, NeoCard } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLORS, Neubrutalism, STATUS_COLORS } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { fetchAniList } from "@/src/services/anilist";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

dayjs.locale("id");

const SCHEDULE_QUERY = `
  query GetSchedule($start: Int, $end: Int) {
    Page(page: 1, perPage: 50) {
      airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
        id
        airingAt
        episode
        media {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            medium
          }
          format
        }
      }
    }
  }
`;

export default function ScheduleScreen() {
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors, isDark } = useTheme();

  // Date picker state: Hari Ini to Hari Ini + 7
  const today = dayjs().startOf("day");
  const [selectedDate, setSelectedDate] = useState(today);
  const dates = Array.from({ length: 8 }).map((_, i) =>
    today.add(i, "day"),
  );

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const start = selectedDate.unix();
        const end = selectedDate.endOf("day").unix();

        const response = await fetchAniList(SCHEDULE_QUERY, { start, end });
        setScheduleList(response.Page.airingSchedules || []);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, [selectedDate]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/(tabs)/home");
            }
          }}
          style={{ marginBottom: 16, alignSelf: "flex-start" }}
          textStyle={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            fontSize: 14,
            color: isDark ? "#000" : COLORS.BUTTON_TEXT_LIGHT,
          }}
        />
        <ThemedText type="title">Jadwal Rilis</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
          Pilih tanggal untuk melihat jadwal rilis episode.
        </ThemedText>
      </ThemedView>

      {/* Date Picker Horizontal */}
      <View style={styles.datePickerContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datePickerScroll}
        >
          {dates.map((date) => {
            const isSelected = date.isSame(selectedDate, "day");
            const isToday = date.isSame(today, "day");

            return (
              <TouchableOpacity
                key={date.toString()}
                onPress={() => setSelectedDate(date)}
                activeOpacity={0.8}
                style={[
                  styles.dateBtn,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? colors.primary
                        : COLORS.PRIMARY
                      : colors.card,
                    borderColor: isSelected
                      ? isDark
                        ? colors.primary
                        : "#000"
                      : colors.border,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.dateDay,
                    { color: isSelected ? "#000" : colors.text },
                  ]}
                >
                  {isToday ? "HARI INI" : date.format("ddd").toUpperCase()}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.dateNumber,
                    { color: isSelected ? "#000" : colors.text },
                  ]}
                >
                  {date.format("DD")}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.timelineScroll}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.PRIMARY}
            style={{ marginTop: 40 }}
          />
        ) : scheduleList.length > 0 ? (
          <View style={styles.timelineContainer}>
            {scheduleList.map((item, idx) => {
              const time = dayjs.unix(item.airingAt).format("HH:mm");
              const media = item.media;
              const title =
                media.title.romaji || media.title.english || "Unknown Title";
              const isLast = idx === scheduleList.length - 1;

              return (
                <View key={item.id} style={styles.timelineRow}>
                  {/* Kolom Kiri: Waktu & Garis */}
                  <View style={styles.timeColumn}>
                    <ThemedText
                      style={[styles.timeText, { color: colors.text }]}
                    >
                      {time}
                    </ThemedText>
                    {/* Dot */}
                    <View
                      style={[
                        styles.timeDot,
                        {
                          backgroundColor: isDark
                            ? colors.accent
                            : STATUS_COLORS.ON_AIR,
                        },
                      ]}
                    />
                    {/* Vertical Line */}
                    {!isLast && (
                      <View
                        style={[
                          styles.timeLine,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    )}
                  </View>

                  {/* Kolom Kanan: Card Anime */}
                  <View style={styles.cardColumn}>
                    <TouchableOpacity
                      onPress={() => router.push(`/anime/${media.id}`)}
                      activeOpacity={0.9}
                    >
                      <NeoCard contentStyle={styles.scheduleCard}>
                        <Image
                          source={{
                            uri:
                              media.coverImage?.large ||
                              media.coverImage?.medium,
                          }}
                          style={styles.thumbnail}
                          contentFit="cover"
                        />
                        <View style={styles.cardInfo}>
                          <ThemedText
                            style={styles.animeTitle}
                            numberOfLines={2}
                          >
                            {title}
                          </ThemedText>
                          <View style={styles.metaRow}>
                            <ThemedText
                              style={[
                                styles.metaText,
                                { color: colors.textMuted },
                              ]}
                            >
                              {media.format || "TV"}
                            </ThemedText>
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>
                                Ep {item.episode}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </NeoCard>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <ThemedText
            style={{
              textAlign: "center",
              marginTop: 40,
              fontStyle: "italic",
              color: colors.textMuted,
            }}
          >
            Tidak ada anime yang rilis pada tanggal ini.
          </ThemedText>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  subtitle: { marginTop: 8, fontSize: 14, fontWeight: "500" },

  // Date Picker
  datePickerContainer: { paddingBottom: 16 },
  datePickerScroll: { paddingHorizontal: 20, gap: 10 },
  dateBtn: {
    width: 60,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Neubrutalism.borderRadius,
    borderWidth: Neubrutalism.borderWidth,
  },
  dateDay: { fontSize: 10, fontWeight: "900", marginBottom: 4 },
  dateNumber: { fontSize: 20, fontWeight: "900" },

  // Timeline
  timelineScroll: { paddingHorizontal: 20, paddingTop: 10 },
  timelineContainer: { flexDirection: "column" },
  timelineRow: { flexDirection: "row", minHeight: 90 },

  timeColumn: {
    width: 50,
    alignItems: "center",
    position: "relative",
    marginRight: 12,
  },
  timeText: { fontSize: 13, fontWeight: "900", marginBottom: 6, zIndex: 2 },
  timeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#000",
    zIndex: 2,
  },
  timeLine: { position: "absolute", top: 32, bottom: 0, width: 2, zIndex: 1 },

  cardColumn: { flex: 1, paddingBottom: 16 },
  scheduleCard: { flexDirection: "row", padding: 8, alignItems: "center" },
  thumbnail: {
    width: 60,
    height: 80,
    borderRadius: Neubrutalism.borderRadius - 2,
    backgroundColor: STATUS_COLORS.DEFAULT,
    borderWidth: 1,
    borderColor: "#000",
  },
  cardInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  animeTitle: { fontSize: 15, fontWeight: "900", marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaText: { fontSize: 12, fontWeight: "700" },
  badge: {
    backgroundColor: STATUS_COLORS.ON_AIR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#000",
  },
  badgeText: { fontSize: 10, fontWeight: "900", color: "#000" },
});
