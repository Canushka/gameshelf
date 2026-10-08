package com.gameshelf.backend.repository;

import com.gameshelf.backend.model.Game;
import com.gameshelf.backend.model.Review;
import com.gameshelf.backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByGame(Game game);

    List<Review> findTop20ByUserInOrderByCreatedAtDesc(
            List<User> users
    );

    List<Review> findTop20ByOrderByCreatedAtDesc();

    boolean existsByUserAndGame(
            User user,
            Game game
    );
}