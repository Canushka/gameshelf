package com.gameshelf.backend.repository;

import com.gameshelf.backend.model.UserFavourite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFavouriteRepository
        extends JpaRepository<UserFavourite, Long> {

    Optional<UserFavourite> findByUserIdAndGameId(
            Long userId,
            Long gameId
    );

    boolean existsByUserIdAndGameId(
            Long userId,
            Long gameId
    );

    List<UserFavourite> findByUserId(Long userId);
}