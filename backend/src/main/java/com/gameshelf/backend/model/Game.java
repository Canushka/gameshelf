package com.gameshelf.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "games")
public class Game {

    @Id
    private Long id; // IGDB game ID

    private String name;

    @Column(length = 1000)
    private String summary;

    private String coverUrl;

    private Long releaseDate;
}