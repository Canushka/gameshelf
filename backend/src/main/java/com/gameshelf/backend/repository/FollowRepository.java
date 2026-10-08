package com.gameshelf.backend.repository;

import com.gameshelf.backend.model.Follow;
import com.gameshelf.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    List<Follow> findByFollower(User follower);
}