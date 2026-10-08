package com.gameshelf.backend.controller;

import com.gameshelf.backend.model.Follow;
import com.gameshelf.backend.repository.FollowRepository;
import com.gameshelf.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/follow")
public class FollowController {

    private final FollowRepository followRepo;
    private final UserRepository userRepo;

    public FollowController(FollowRepository followRepo,
                            UserRepository userRepo) {
        this.followRepo = followRepo;
        this.userRepo = userRepo;
    }

    @PostMapping("/{userId}")
    public String followUser(@PathVariable Long userId,
                             Principal principal) {

        var follower = userRepo.findByEmail(principal.getName()).orElseThrow();
        var following = userRepo.findById(userId).orElseThrow();

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);

        followRepo.save(follow);
        return "Now following " + following.getUsername();
    }
}