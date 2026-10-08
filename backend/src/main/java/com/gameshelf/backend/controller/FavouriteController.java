package com.gameshelf.backend.controller;

import com.gameshelf.backend.model.Game;
import com.gameshelf.backend.model.User;
import com.gameshelf.backend.model.UserFavourite;
import com.gameshelf.backend.repository.GameRepository;
import com.gameshelf.backend.repository.UserFavouriteRepository;
import com.gameshelf.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favourites")
@CrossOrigin(origins = "http://localhost:5173")
public class FavouriteController {

    private final UserFavouriteRepository favouriteRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    public FavouriteController(
            UserFavouriteRepository favouriteRepository,
            UserRepository userRepository,
            GameRepository gameRepository
    ) {
        this.favouriteRepository = favouriteRepository;
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
    }

    // ----------------------------------------------------
    // GET ALL FAVOURITES
    // ----------------------------------------------------

    @GetMapping
    public ResponseEntity<List<UserFavourite>> getFavourites(
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        return ResponseEntity.ok(
                favouriteRepository.findByUserId(user.getId())
        );
    }

    // ----------------------------------------------------
    // CHECK IF GAME IS A FAVOURITE
    // ----------------------------------------------------

    @GetMapping("/{gameId}")
    public ResponseEntity<Boolean> isFavourite(
            @PathVariable Long gameId,
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        boolean favourite =
                favouriteRepository.existsByUserIdAndGameId(
                        user.getId(),
                        gameId
                );

        return ResponseEntity.ok(favourite);
    }

    // ----------------------------------------------------
    // ADD FAVOURITE
    // ----------------------------------------------------

    @PostMapping("/{gameId}")
    public ResponseEntity<?> addFavourite(
            @PathVariable Long gameId,
            @RequestBody(required = false) Game gameData,
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        // Already a favourite
        if (favouriteRepository.existsByUserIdAndGameId(
                user.getId(),
                gameId
        )) {

            return ResponseEntity
                    .status(409)
                    .body("Game is already in your favourites");
        }

        // Try to find the game in our local database
        Game game = gameRepository.findById(gameId)
                .orElse(null);

        // If it doesn't exist locally, create it
        if (game == null) {

            if (gameData == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Game information is required");
            }

            game = new Game();

            game.setId(gameId);
            game.setName(gameData.getName());
            game.setSummary(gameData.getSummary());
            game.setCoverUrl(gameData.getCoverUrl());
            game.setReleaseDate(gameData.getReleaseDate());

            game = gameRepository.save(game);
        }

        UserFavourite favourite = new UserFavourite();

        favourite.setUser(user);
        favourite.setGame(game);

        UserFavourite saved =
                favouriteRepository.save(favourite);

        return ResponseEntity.ok(saved);
    }

    // ----------------------------------------------------
    // REMOVE FAVOURITE
    // ----------------------------------------------------

    @DeleteMapping("/{gameId}")
    public ResponseEntity<?> removeFavourite(
            @PathVariable Long gameId,
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        UserFavourite favourite =
                favouriteRepository
                        .findByUserIdAndGameId(
                                user.getId(),
                                gameId
                        )
                        .orElse(null);

        if (favourite == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        favouriteRepository.delete(favourite);

        return ResponseEntity.ok(
                "Game removed from favourites"
        );
    }

    // ----------------------------------------------------
    // CURRENT USER
    // ----------------------------------------------------

    private User getCurrentUser(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }
}