package com.gameshelf.backend.controller;

import com.gameshelf.backend.model.Review;
import com.gameshelf.backend.repository.GameRepository;
import com.gameshelf.backend.repository.UserRepository;
import com.gameshelf.backend.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final GameRepository gameRepo;
    private final UserRepository userRepo;

    public ReviewController(
            ReviewService reviewService,
            GameRepository gameRepo,
            UserRepository userRepo
    ) {
        this.reviewService = reviewService;
        this.gameRepo = gameRepo;
        this.userRepo = userRepo;
    }

    @PostMapping("/{gameId}")
    public ResponseEntity<?> addReview(
            @PathVariable Long gameId,
            @RequestBody Map<String, Object> body,
            Principal principal
    ) {

        var user = userRepo
                .findByEmail(principal.getName())
                .orElseThrow();

        var game = gameRepo
                .findById(gameId)
                .orElseThrow();

        if (reviewService.hasUserReviewed(user, game)) {
            return ResponseEntity
                    .status(409)
                    .body("You have already reviewed this game.");
        }

        Review review = new Review();

        review.setUser(user);
        review.setGame(game);

        Number rating = (Number) body.get("rating");
        review.setRating(rating.intValue());

        review.setText((String) body.get("text"));

        return ResponseEntity.ok(
                reviewService.saveReview(review)
        );
    }

    @GetMapping("/{gameId}")
    public List<Review> getReviews(
            @PathVariable Long gameId
    ) {

        var game = gameRepo
                .findById(gameId)
                .orElseThrow();

        return reviewService.getReviewsForGame(game);
    }

    @GetMapping("/{gameId}/average")
    public double getAverage(
            @PathVariable Long gameId
    ) {

        var game = gameRepo
                .findById(gameId)
                .orElseThrow();

        return reviewService.getAverageRating(game);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, Object> body,
            Principal principal
    ) {

        var user = userRepo
                .findByEmail(principal.getName())
                .orElseThrow();

        return reviewService
                .updateReview(reviewId, user, body);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long reviewId,
            Principal principal
    ) {

        var user = userRepo
                .findByEmail(principal.getName())
                .orElseThrow();

        return reviewService.deleteReview(reviewId, user);
    }
}