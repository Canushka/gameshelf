package com.gameshelf.backend.controller;

import com.gameshelf.backend.model.Review;
import com.gameshelf.backend.repository.ReviewRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/feed")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedController {

    private final ReviewRepository reviewRepository;

    public FeedController(
            ReviewRepository reviewRepository
    ) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public ResponseEntity<List<FeedItem>> getFeed() {

        List<Review> reviews =
                reviewRepository.findTop20ByOrderByCreatedAtDesc();

        List<FeedItem> feed = reviews.stream()
                .map(review -> new FeedItem(

                        review.getId(),

                        review.getUser() != null
                                ? review.getUser().getId()
                                : null,

                        review.getUser() != null
                                ? review.getUser().getUsername()
                                : "Anonymous",

                        review.getGame() != null
                                ? review.getGame().getId()
                                : null,

                        review.getGame() != null
                                ? review.getGame().getName()
                                : "Unknown Game",

                        review.getGame() != null
                                ? review.getGame().getCoverUrl()
                                : null,

                        review.getRating(),

                        review.getText(),

                        review.getCreatedAt()
                ))
                .toList();

        return ResponseEntity.ok(feed);
    }

    public record FeedItem(
            Long reviewId,
            Long userId,
            String username,
            Long gameId,
            String gameName,
            String coverUrl,
            int rating,
            String text,
            LocalDateTime createdAt
    ) {
    }
}