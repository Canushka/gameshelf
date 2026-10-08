package com.gameshelf.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.gameshelf.backend.dto.GameSearchDto;
import com.gameshelf.backend.service.IgdbGameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/games")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {

    private final IgdbGameService igdbGameService;

    public GameController(IgdbGameService igdbGameService) {
        this.igdbGameService = igdbGameService;
    }


    @GetMapping("/search")
    public ResponseEntity<List<GameSearchDto>> searchGames(
            @RequestParam("q") String query
    ) {

        return ResponseEntity.ok(
                igdbGameService.searchGames(query)
        );
    }


    @GetMapping("/discover")
    public ResponseEntity<IgdbGameService.DiscoverData> discover() {

        return ResponseEntity.ok(
                igdbGameService.getDiscoverData()
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<JsonNode> getGame(
            @PathVariable Long id
    ) {

        JsonNode game =
                igdbGameService.getGame(id);

        if (game == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(game);
    }
}