package com.gameshelf.backend.service;

import com.gameshelf.backend.model.Game;
import com.gameshelf.backend.model.Review;
import com.gameshelf.backend.model.User;
import com.gameshelf.backend.repository.ReviewRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepo;

    public ReviewService(ReviewRepository reviewRepo) {
        this.reviewRepo = reviewRepo;
    }

    public Review saveReview(Review review) {
        review.setCreatedAt(LocalDateTime.now());
        return reviewRepo.save(review);
    }

    public List<Review> getReviewsForGame(Game game) {
        return reviewRepo.findByGame(game);
    }

    public double getAverageRating(Game game) {
        var reviews = reviewRepo.findByGame(game);

        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }

    public boolean hasUserReviewed(User user, Game game) {
        return reviewRepo.existsByUserAndGame(user, game);
    }

    public ResponseEntity<?> updateReview(
            Long reviewId,
            User user,
            Map<String, Object> body
    ) {

        return reviewRepo.findById(reviewId)
                .map(review -> {

                    if (!review.getUser().getId().equals(user.getId())) {
                        return ResponseEntity
                                .status(403)
                                .body("You can only edit your own review.");
                    }

                    Number rating = (Number) body.get("rating");

                    if (rating != null) {
                        review.setRating(rating.intValue());
                    }

                    if (body.get("text") != null) {
                        review.setText(
                                body.get("text").toString()
                        );
                    }

                    return ResponseEntity.ok(
                            reviewRepo.save(review)
                    );
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    public ResponseEntity<?> deleteReview(
            Long reviewId,
            User user
    ) {

        return reviewRepo.findById(reviewId)
                .map(review -> {

                    if (!review.getUser().getId().equals(user.getId())) {
                        return ResponseEntity
                                .status(403)
                                .body("You can only delete your own review.");
                    }

                    reviewRepo.delete(review);

                    return ResponseEntity.ok(
                            "Review deleted successfully."
                    );
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }
}