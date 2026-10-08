package com.gameshelf.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class IgdbAuthService {

    private final RestClient restClient;

    @Value("${igdb.auth-url}")
    private String authUrl;

    @Value("${igdb.client-id}")
    private String clientId;

    @Value("${igdb.client-secret}")
    private String clientSecret;

    private String accessToken;

    public IgdbAuthService(RestClient.Builder builder) {
        this.restClient = builder.build();
    }

    public String getAccessToken() {

        if (accessToken != null) {
            return accessToken;
        }

        MultiValueMap<String, String> body =
                new LinkedMultiValueMap<>();

        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "client_credentials");

        Map<String, Object> response = restClient
                .post()
                .uri(authUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("access_token") == null) {
            throw new IllegalStateException(
                    "Unable to obtain IGDB access token"
            );
        }

        accessToken = response.get("access_token").toString();

        return accessToken;
    }
}