package com.gameshelf.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gameshelf.backend.dto.GameSearchDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
public class IgdbGameService {

    @Value("${igdb.client-id}")
    private String clientId;

    @Value("${igdb.api.base-url}")
    private String apiUrl;

    private final IgdbAuthService authService;
    private final ObjectMapper objectMapper;

    public IgdbGameService(
            IgdbAuthService authService,
            ObjectMapper objectMapper
    ) {
        this.authService = authService;
        this.objectMapper = objectMapper;
    }

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------

    public List<GameSearchDto> searchGames(String query) {

        String body = """
                search "%s";
                fields id,name,summary,cover.url,first_release_date,rating,rating_count,genres.name,platforms.name;
                limit 20;
                """.formatted(
                query.replace("\"", "\\\"")
        );

        JsonNode root = igdbRequest("/games", body);

        return convertGames(root);
    }


    // ---------------------------------------------------------
    // SINGLE GAME
    // ---------------------------------------------------------

    public JsonNode getGame(Long id) {

        String body = """
                fields
                    id,
                    name,
                    summary,
                    storyline,
                    cover.url,
                    screenshots.url,
                    first_release_date,
                    rating,
                    aggregated_rating,
                    genres.name,
                    platforms.name,
                    involved_companies.company.name,
                    involved_companies.developer,
                    involved_companies.publisher;
                where id = %d;
                """.formatted(id);

        JsonNode root = igdbRequest("/games", body);

        if (!root.isArray() || root.isEmpty()) {
            return null;
        }

        return root.get(0);
    }


    // ---------------------------------------------------------
    // DISCOVER
    // ---------------------------------------------------------

    public DiscoverData getDiscoverData() {

        /*
         * TRENDING
         *
         * IGDB popularity type 1 = Visits.
         *
         * First obtain the most visited game IDs,
         * then fetch the actual game objects.
         */

        String trendingBody = """
                fields game_id,value;
                where popularity_type = 1;
                sort value desc;
                limit 10;
                """;

        JsonNode popularityRoot =
                igdbRequest("/popularity_primitives", trendingBody);

        List<Long> trendingIds = new ArrayList<>();

        if (popularityRoot.isArray()) {
            for (JsonNode node : popularityRoot) {
                if (node.has("game_id")) {
                    trendingIds.add(node.get("game_id").asLong());
                }
            }
        }

        List<GameSearchDto> trending =
                getGamesByIds(trendingIds);


        /*
         * POPULAR
         *
         * rating_count gives us a useful measure of
         * how many users have rated a game.
         */

        String popularBody = """
                fields id,name,summary,cover.url,first_release_date,rating,rating_count,genres.name,platforms.name;
                where rating_count > 50 & version_parent = null;
                sort rating_count desc;
                limit 10;
                """;

        JsonNode popularRoot =
                igdbRequest("/games", popularBody);

        List<GameSearchDto> popular =
                convertGames(popularRoot);


        /*
         * RECENTLY RELEASED
         *
         * Get games released during the current year.
         */

        long startOfYear = LocalDate
                .of(LocalDate.now().getYear(), 1, 1)
                .atStartOfDay()
                .toEpochSecond(ZoneOffset.UTC);

        String recentBody = """
                fields id,name,summary,cover.url,first_release_date,rating,rating_count,genres.name,platforms.name;
                where first_release_date >= %d & first_release_date != null & version_parent = null;
                sort first_release_date desc;
                limit 10;
                """.formatted(startOfYear);

        JsonNode recentRoot =
                igdbRequest("/games", recentBody);

        List<GameSearchDto> recent =
                convertGames(recentRoot);


        /*
         * FEATURED
         *
         * Use the first trending game as the hero.
         * If trending is empty, fall back to popular.
         */

        GameSearchDto featured = null;

        if (!trending.isEmpty()) {
            featured = trending.get(0);
        } else if (!popular.isEmpty()) {
            featured = popular.get(0);
        } else if (!recent.isEmpty()) {
            featured = recent.get(0);
        }

        return new DiscoverData(
                featured,
                trending,
                popular,
                recent
        );
    }


    // ---------------------------------------------------------
    // FETCH GAMES BY IDS
    // ---------------------------------------------------------

    private List<GameSearchDto> getGamesByIds(List<Long> ids) {

        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }

        String idList = ids.stream()
                .map(String::valueOf)
                .reduce((a, b) -> a + "," + b)
                .orElse("");

        String body = """
                fields id,name,summary,cover.url,first_release_date,rating,rating_count,genres.name,platforms.name;
                where id = (%s);
                limit 10;
                """.formatted(idList);

        JsonNode root = igdbRequest("/games", body);

        List<GameSearchDto> games = convertGames(root);

        /*
         * IGDB may not return the games in the exact order
         * of the popularity IDs, so restore that order.
         */

        games.sort((a, b) -> {
            int indexA = ids.indexOf(a.getId());
            int indexB = ids.indexOf(b.getId());

            return Integer.compare(indexA, indexB);
        });

        return games;
    }


    // ---------------------------------------------------------
    // IGDB REQUEST
    // ---------------------------------------------------------

    private JsonNode igdbRequest(String endpoint, String body) {

        RestTemplate rest = new RestTemplate();

        var headers =
                new org.springframework.http.HttpHeaders();

        headers.set(
                "Client-ID",
                clientId
        );

        headers.set(
                "Authorization",
                "Bearer " + authService.getAccessToken()
        );

        headers.set(
                "Content-Type",
                "text/plain"
        );

        var entity =
                new org.springframework.http.HttpEntity<>(
                        body,
                        headers
                );

        String response = rest.postForObject(
                apiUrl + endpoint,
                entity,
                String.class
        );

        try {

            return objectMapper.readTree(response);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to parse IGDB response",
                    e
            );
        }
    }


    // ---------------------------------------------------------
    // JSON -> DTO
    // ---------------------------------------------------------

    private List<GameSearchDto> convertGames(JsonNode root) {

        List<GameSearchDto> games = new ArrayList<>();

        if (root == null || !root.isArray()) {
            return games;
        }

        for (JsonNode node : root) {

            Long id =
                    node.has("id")
                            ? node.get("id").asLong()
                            : null;

            String name =
                    node.has("name")
                            ? node.get("name").asText()
                            : "";

            String summary =
                    node.has("summary")
                            ? node.get("summary").asText()
                            : "";

            Long firstReleaseDate =
                    node.has("first_release_date")
                            ? node.get("first_release_date").asLong()
                            : null;

            Double rating =
                    node.has("rating")
                            ? node.get("rating").asDouble()
                            : null;

            Integer ratingCount =
                    node.has("rating_count")
                            ? node.get("rating_count").asInt()
                            : null;

            List<String> genres = new ArrayList<>();

            if (node.has("genres") && node.get("genres").isArray()) {
                for (JsonNode genre : node.get("genres")) {
                    if (genre.has("name")) {
                        genres.add(genre.get("name").asText());
                    }
                }
            }

            String coverUrl = null;

            if (
                    node.has("cover")
                            && node.get("cover").has("url")
            ) {

                coverUrl =
                        node.get("cover")
                                .get("url")
                                .asText();

                if (coverUrl.startsWith("//")) {
                    coverUrl = "https:" + coverUrl;
                }

                coverUrl =
                        coverUrl.replace(
                                "/t_thumb/",
                                "/t_cover_big/"
                        );
            }

            games.add(
                    new GameSearchDto(
                            id,
                            name,
                            summary,
                            coverUrl,
                            firstReleaseDate,
                            rating,
                            ratingCount,
                            genres
                    )
            );
        }

        return games;
    }


    // ---------------------------------------------------------
    // DISCOVER RESPONSE
    // ---------------------------------------------------------

    public record DiscoverData(
            GameSearchDto featured,
            List<GameSearchDto> trending,
            List<GameSearchDto> popular,
            List<GameSearchDto> recent
    ) {
    }
}