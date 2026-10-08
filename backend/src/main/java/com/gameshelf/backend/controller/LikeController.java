package com.gameshelf.backend.controller;

import com.gameshelf.backend.model.Like;
import com.gameshelf.backend.repository.LikeRepository;
import com.gameshelf.backend.repository.ReviewRepository;
import com.gameshelf.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/likes")
public class LikeController {

    private final LikeRepository likeRepo;
    private final ReviewRepository reviewRepo;
    private final UserRepository userRepo;

    public LikeController(LikeRepository likeRepo,
                          ReviewRepository reviewRepo,
                          UserRepository userRepo) {
        this.likeRepo = likeRepo;
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
    }

    @PostMapping("/{reviewId}")
    public String likeReview(@PathVariable Long reviewId,
                             Principal principal) {

        var user = userRepo.findByEmail(principal.getName()).orElseThrow();
        var review = reviewRepo.findById(reviewId).orElseThrow();

        Like like = new Like();
        like.setUser(user);
        like.setReview(review);

        likeRepo.save(like);
        return "Liked review!";
    }

    @GetMapping("/{reviewId}/count")
    public long likeCount(@PathVariable Long reviewId) {
        var review = reviewRepo.findById(reviewId).orElseThrow();
        return likeRepo.countByReview(review);
    }
}