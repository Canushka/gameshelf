package com.gameshelf.backend.controller;

import com.gameshelf.backend.model.Game;
import com.gameshelf.backend.model.User;
import com.gameshelf.backend.model.UserGame;
import com.gameshelf.backend.repository.GameRepository;
import com.gameshelf.backend.repository.UserGameRepository;
import com.gameshelf.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/library")
public class LibraryController {

    private final UserGameRepository userGameRepo;
    private final UserRepository userRepo;
    private final GameRepository gameRepo;

    public LibraryController(
            UserGameRepository userGameRepo,
            UserRepository userRepo,
            GameRepository gameRepo
    ) {
        this.userGameRepo = userGameRepo;
        this.userRepo = userRepo;
        this.gameRepo = gameRepo;
    }

    // Get current user's library
    @GetMapping
    public List<UserGame> myLibrary(Principal principal) {

        User user = userRepo
                .findByEmail(principal.getName())
                .orElseThrow();

        return userGameRepo.findByUserId(user.getId());
    }

    // Add a game to the library
    @PostMapping("/{gameId}")
    public ResponseEntity<?> addToLibrary(
            @PathVariable Long gameId,
            @RequestBody Map<String, Object> body,
            Principal principal
    ) {

        User user = userRepo
                .findByEmail(principal.getName())
                .orElseThrow();

        // Prevent duplicate games
        if (userGameRepo.existsByUserIdAndGameId(
                user.getId(),
                gameId
        )) {
            return ResponseEntity
                    .status(409)
                    .body("Game already exists in your library");
        }

        /*
         * Check whether this game already exists
         * in our local games table.
         */
        Game game = gameRepo.findById(gameId)
                .orElseGet(() -> {

                    Game newGame = new Game();

                    newGame.setId(gameId);

                    newGame.setName(
                            (String) body.getOrDefault(
                                    "name",
                                    "Unknown Game"
                            )
                    );

                    newGame.setSummary(
                            (String) body.getOrDefault(
                                    "summary",
                                    ""
                            )
                    );

                    newGame.setCoverUrl(
                            (String) body.get("coverUrl")
                    );

                    Object releaseDate =
                            body.get("releaseDate");

                    if (releaseDate != null) {
                        newGame.setReleaseDate(
                                Long.valueOf(
                                        releaseDate.toString()
                                )
                        );
                    }

                    return gameRepo.save(newGame);
                });

        UserGame userGame = new UserGame();

        userGame.setUser(user);
        userGame.setGame(game);

        // Default status
        String status =
                body.get("status") != null
                        ? body.get("status").toString()
                        : "WISHLIST";

        userGame.setStatus(status);

        UserGame saved =
                userGameRepo.save(userGame);

        return ResponseEntity.ok(saved);
    }

    // Remove a game from the library
    @DeleteMapping("/{gameId}")
    public ResponseEntity<?> removeFromLibrary(
            @PathVariable Long gameId,
            Principal principal
    ) {

        User user = userRepo
                .findByEmail(principal.getName())
                .orElseThrow();

        return userGameRepo
                .findByUserIdAndGameId(
                        user.getId(),
                        gameId
                )
                .map(userGame -> {

                    userGameRepo.delete(userGame);

                    return ResponseEntity.ok(
                            "Game removed from library"
                    );
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }
}