package com.gameshelf.backend.repository;

import com.gameshelf.backend.model.Like;
import com.gameshelf.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
    long countByReview(Review review);
}